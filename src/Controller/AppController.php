<?php

namespace App\Controller;

use App\Entity\Ideas;
use Doctrine\ORM\EntityManager;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\FFMpeg;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
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
                $video = $ffmpeg->open($project_dir . $filename)
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
                'filename' => '/' . $_SERVER["APP_NAME"] . '/' . ($prefix ? $prefix . '/' : '') . $filename,
                'original_name' => $file->getClientOriginalName(),
                'id' => uniqid()
            ];

            if ($file_preview) {
                $res['file_preview'] = '/' . $_SERVER["APP_NAME"] . '/' . $file_preview;
            }


        }

        return $res;
    }

    static public function sendEmail(MailerInterface $mailer, $message, $subject = "Новый отзыв", $tomail = "bumblebeelion@atma.company", $bcc = "yakov@atmapro.ru")
    { // damedvedev@atmapro.ru  bumblebeelion@atma.company  atmaguru@atmadev.ru
        if (!empty($message)) {
            $email = (new Email())
                ->from($_ENV['MAILER_FROM'])
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

    static public function array_sort($array, $on, $order = SORT_ASC)
    {
        $new_array = array();
        $sortable_array = array();

        if (!empty($array)) {
            foreach ($array as $k => $v) {
                if (is_array($v)) {
                    foreach ($v as $k2 => $v2) {
                        if ($k2 == $on) {
                            $sortable_array[$k] = $v2;
                        }
                    }
                } else {
                    $sortable_array[$k] = $v;
                }
            }

            switch ($order) {
                case SORT_ASC:
                    asort($sortable_array);
                    break;
                case SORT_DESC:
                    arsort($sortable_array);
                    break;
            }

            foreach ($sortable_array as $k => $v) {
                $new_array[$k] = $array[$k];
            }
        }

        return array_values((array)$new_array);
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

    static public function curl($url, $method, $params = array())
    {
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

    static public function num_word($value, $words, $show = true)
    {
        $num = $value % 100;
        if ($num > 19) {
            $num = $num % 10;
        }

        $out = ($show) ? $value . ' ' : '';
        switch ($num) {
            case 1:
                $out .= $words[0];
                break;
            case 2:
            case 3:
            case 4:
                $out .= $words[1];
                break;
            default:
                $out .= $words[2];
                break;
        }

        return $out;
    }

    static public function decodeBase64User($userBase64)
    {
        return explode(":", base64_decode(strtr($userBase64, '._-', '+/=')));
    }

    static public function encodeBase64User($email, $pass)
    {
        return strtr(base64_encode($email . ':' . $pass), '+/=', '._-');
    }

    static public function getExpires()
    {
        return time() + 3600 * 6;
    }

    static public function checkExpires($expires)
    {
        return time() < $expires;
    }
}
