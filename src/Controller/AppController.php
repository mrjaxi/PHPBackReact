<?php

namespace App\Controller;

use App\Entity\Video;
use Doctrine\ORM\EntityManager;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\FFMpeg;
use App\Entity\Answer;
use App\Entity\Exercise;
use App\Entity\Lesson;
use App\Entity\Map;
use App\Entity\MapItem;
use App\Entity\Result;
use App\Entity\ResultAnswer;
use App\Entity\ResultExerciseItem;
use App\Entity\ResultItem;
use App\Entity\ResultTesting;
use App\Entity\Testing;
use App\Kernel;
use FFMpeg\Format\Video\X264;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;

class AppController extends AbstractController
{
    static public function saveFile(Request $request, $project_dir, EntityManager $em, $prefix = false)
    {
        if (!is_dir($project_dir)) {
            mkdir($project_dir);
            mkdir($project_dir . 'u/');
            mkdir($project_dir . 'u/f/');
            mkdir($project_dir . 'u/i/');
            mkdir($project_dir . 'u/v/');
        }
        if ($prefix) {
            if (!is_dir($project_dir . $prefix . '/')) {
                mkdir($project_dir . $prefix . '/');
                mkdir($project_dir . $prefix . '/u/');
                mkdir($project_dir . $prefix . '/u/f/');
                mkdir($project_dir . $prefix . '/u/i/');
                mkdir($project_dir . $prefix . '/u/v/');
            }
            $project_dir = $project_dir . $prefix . '/';
        }

        $res = ['state' => 'error', 'message' => 'File not found'];
        $file = $request->files->get('file');
        if ($file) {
            $sha = AppController::generateUuid();
            $sha_array = str_split($sha);
            $file_preview = false;

            $ext = strtolower(substr($file->getClientOriginalName(), strrpos($file->getClientOriginalName(), '.')));
            $is_video = $ext === '.mp4' || $ext === '.webm';
            $filename = 'u/' . ($is_video ? 'v/' :
                    ($ext === '.jpg' || $ext === '.jpeg' || $ext === '.png' || $ext === '.gif' ? 'i/' : 'f/'));

            foreach ($sha_array as $i => $dir) {
                if ($i > 2) {
                    $filename .= mb_substr($sha, $i);
                    break;
                }
                if (!is_dir($project_dir . $filename . $dir)) {
                    mkdir($project_dir . $filename . $dir);
                }
                $filename .= $dir . '/';
            }

            if ($ext === '.mp4' || $ext === '.webm') {
                $file_preview = $filename . '_preview.png';
            }
            $filename .= $ext;

            rename($file->getPathname(), $project_dir . $filename);
            chmod($project_dir . $filename, 0777);

            $paramsFfmpeg = (PHP_OS === 'Darwin' ? [
                'ffmpeg.binaries' => '/usr/local/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/local/bin/ffprobe'
            ] : [
                'ffmpeg.binaries' => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe'
            ]);

            if ($is_video) {

//                @exec('ffmpeg -i ' . $project_dir . $filename . ' -ab 128k -vcodec libx264 -vb 2000k ' . $project_dir . $filename . '.tmp && mv -f ' . $project_dir . $filename . '.tmp ' . $project_dir . explode('.', $filename)[0] . '.mp4');
//                $ffmpeg = FFMpeg::create($paramsFfmpeg);
//                $video = $ffmpeg->open($project_dir . $filename);
//                $format = new X264();
//                $format->setAudioCodec("libmp3lame");
//
//
//                $filename = explode('.', $filename)[0] . '.mp4';
//                $video->save($format, $project_dir . $filename);
//                @unlink($file->getPathname());
            }

            if ($file_preview) {

                $ffmpeg = FFMpeg::create($paramsFfmpeg);
                $video = $ffmpeg->open($project_dir  . $filename)
                    ->frame(TimeCode::fromSeconds(1))
                    ->save($project_dir . $file_preview);

                if (file_exists($project_dir . $file_preview)) {
                    chmod($project_dir . $file_preview, 0644);
                }
            }
            if (file_exists($project_dir . $filename)) {
                chmod($project_dir . $filename, 0644);
            } else {
                return ['state' => 'error'];
            }

//            if ($is_video) {
//                $newVideo = (new Video())
//                    ->setLocalUrl('/' . $_SERVER["APP_NAME"] . '/' . ($prefix ? $prefix . '/' : '' ) . $filename)
//                    ->setIsLoaded(0);
//                $em->persist($newVideo);
//                $em->flush();
//            }

//            $res = [
//                'state' => 'success',
//                'filename' => ($is_video ?
//                    '/api/video/' . $newVideo->getId() . '/' :
//                    '/' . $_SERVER["APP_NAME"] . '/' . ($prefix ? $prefix . '/' : '' ) . $filename),
//                'original_name' => $file->getClientOriginalName(),
//                'id' => uniqid()
//            ];
            $res = [
                'state' => 'success',
                'filename' => '/' . $_SERVER["APP_NAME"] . '/' . ($prefix ? $prefix . '/' : '' ) . $filename,
                'original_name' => $file->getClientOriginalName(),
                'id' => uniqid()
            ];

            if ($file_preview) {
                $res['file_preview'] = '/' . $_SERVER["APP_NAME"] . '/' . $file_preview;
            }


        }

        return $res;
    }

    static public function sendEmail(MailerInterface $mailer, $message, $subject="Новый отзыв", $tomail="damedvedev@atmapro.ru")
    {
        $from_mail = "atmaguru@atmadev.ru"; // tip@atmaguru.online || atmaguru@atmadev.ru
        $bcc = "bumblebeelion@atma.company";
        if (!empty($message)) {
            $email = (new Email())
                ->from($from_mail)
                ->to($tomail)
                ->bcc($bcc)
                ->subject($subject)
                ->text($message);
//                ->attachFromPath($filepath . $filename, 'qrcode')
//                ->html($html);

            $mailer->send($email);
            return true;
        }
        return false;
    }

    static public function randomPassword()
    {
        $alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        $pass = [];
        $alphaLength = strlen($alphabet) - 1;
        for ($i = 0; $i < 8; $i++) {
            $n = rand(0, $alphaLength);
            $pass[] = $alphabet[$n];
        }
        return implode($pass);
    }

    static public function generateUuid()
    {
        mt_srand((double)microtime() * 10000);
        $charid = strtolower(md5(uniqid(rand(), true)));
        $hyphen = chr(45);
        $uuid = substr($charid, 0, 8) . $hyphen . substr($charid, 8, 4) . $hyphen . substr($charid, 12, 4) . $hyphen . substr($charid, 16, 4) . $hyphen . substr($charid, 20, 12);
        return $uuid;
    }

    static public function curl($url, $method, $params=array()){
        $api_key = "va1wkw9GXs4NhbzgQkGs";

        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => json_encode($params),
            CURLOPT_HTTPHEADER => array(
                "Accept: application/json",
                "Content-Type: application/JSON",
                "Private-Token: " . $api_key
            ),
        ));
        $response = curl_exec($curl);

        curl_close($curl);

        return $response;
    }

    static public function add_file($files){
        $photo = null;
        if($files == null)
            return $photo;

        for($i=0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] == 0) {
                if ($files['size'][$i] == 0) {
                    continue;
                }

                $getMime = explode('.', $files['name'][$i]);
                $mime = strtolower(end($getMime));
                $types = array('jpg', 'png', 'gif', 'bmp', 'jpeg');

                if (!in_array($mime, $types)) {
                    continue;
                }

                $name = 'photo\\' . md5(microtime() . rand(0, 9999)) . "." . $mime;

                $photo = $photo . $name . ";";
                copy($files['tmp_name'][$i], __DIR__ . "/../../public/" . $name);
            }
        }

        return $photo;
    }

    static public function decodeBase64User($userBase64){
        return explode(":", base64_decode(strtr($userBase64, '._-', '+/=')));
    }

    static public function encodeBase64User($email, $pass){
        return strtr(base64_encode($email . ':' . $pass), '+/=', '._-');
    }
}
