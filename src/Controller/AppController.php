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

    static public function mailPattern($message){
        return "
        <!DOCTYPE html>
<html xmlns=\"http://www.w3.org/1999/xhtml\">

<head>
    <meta content=\"text/html; charset=utf-8\" http-equiv=\"Content-Type\">
    <meta content=\"width=device-width\" name=\"viewport\">

    <style>
        body {
            width: 100% !important; min-width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; margin: 0; padding: 0;
        }
        .ExternalClass {
            width: 100%;
        }
        .ExternalClass {
            line-height: 100%;
        }
        #backgroundTable {
            margin: 0; padding: 0; width: 100% !important; line-height: 100% !important;
        }
        body {
            background-color: #ffffff; background-repeat: repeat; background-position: center top;
        }
        body {
            color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; padding: 0; margin: 0; text-align: left; line-height: 1.3;
        }
        a:hover {
            color: #2795b6;
        }
        a:active {
            color: #2795b6;
        }
        a:visited {
            color: #1790ff;
        }
        h1 a:active {
            color: #1790ff !important;
        }
        h2 a:active {
            color: #1790ff !important;
        }
        h3 a:active {
            color: #1790ff !important;
        }
        h4 a:active {
            color: #1790ff !important;
        }
        h5 a:active {
            color: #1790ff !important;
        }
        h6 a:active {
            color: #1790ff !important;
        }
        h1 a:visited {
            color: #1790ff !important;
        }
        h2 a:visited {
            color: #1790ff !important;
        }
        h3 a:visited {
            color: #1790ff !important;
        }
        h4 a:visited {
            color: #1790ff !important;
        }
        h5 a:visited {
            color: #1790ff !important;
        }
        h6 a:visited {
            color: #1790ff !important;
        }
        table.secondary:hover td {
            background: #d0d0d0 !important; color: #555555;
        }
        table.secondary:hover td a {
            color: #555555 !important;
        }
        table.secondary td a:visited {
            color: #555555 !important;
        }
        table.secondary:active td a {
            color: #555555 !important;
        }
        table.success:hover td {
            background: #457a1a !important;
        }
        table.alert:hover td {
            background: #970b0e !important;
        }
        body.outlook p {
            display: inline !important;
        }
        @media only screen and (min-width: 768px) {
            table.container {
                width: 580px !important;
            }
            .mail .hide-for-desktop {
                display: none !important;
            }
            .mail .hide-and-true {
                display: none;
            }
            .mail .hide-and-false {
                display: block !important;
            }
            .mail .hide-or-true {
                display: none !important;
            }
        }
        @media only screen and (max-width: 600px) {
            .mail img {
                max-width: 100% !important; max-height: 100% !important; padding: 0 !important; width: auto !important; height: auto !important;
            }
            .mail .social img {
                width: inherit !important;
            }
            .mail img.normal {
                width: inherit !important;
            }
            .mail center {
                min-width: 0 !important;
            }
            .mail .container {
                width: 100% !important;
            }
            .mail .row {
                width: 100% !important; display: block !important;
            }
            .mail .wrapper {
                display: block !important; padding-right: 0 !important;
            }
            .mail .columns {
                table-layout: fixed !important; float: none !important; width: 100% !important; padding-right: 0px !important; padding-left: 0px !important; display: block !important;
            }
            .mail .column {
                table-layout: fixed !important; float: none !important; width: 100% !important; padding-right: 0px !important; padding-left: 0px !important; display: block !important;
            }
            .mail .wrapper.first .columns {
                display: table !important;
            }
            .mail .wrapper.first .column {
                display: table !important;
            }
            .mail table.columns > tbody > tr > td {
                width: 100% !important;
            }
            .mail table.column > tbody > tr > td {
                width: 100% !important;
            }
            .mail .columns td.one {
                width: 8.333333% !important;
            }
            .mail .column td.one {
                width: 8.333333% !important;
            }
            .mail .columns td.two {
                width: 16.666666% !important;
            }
            .mail .column td.two {
                width: 16.666666% !important;
            }
            .mail .columns td.three {
                width: 25% !important;
            }
            .mail .column td.three {
                width: 25% !important;
            }
            .mail .columns td.four {
                width: 33.333333% !important;
            }
            .mail .column td.four {
                width: 33.333333% !important;
            }
            .mail .columns td.five {
                width: 41.666666% !important;
            }
            .mail .column td.five {
                width: 41.666666% !important;
            }
            .mail .columns td.six {
                width: 50% !important;
            }
            .mail .column td.six {
                width: 50% !important;
            }
            .mail .columns td.seven {
                width: 58.333333% !important;
            }
            .mail .column td.seven {
                width: 58.333333% !important;
            }
            .mail .columns td.eight {
                width: 66.666666% !important;
            }
            .mail .column td.eight {
                width: 66.666666% !important;
            }
            .mail .columns td.nine {
                width: 75% !important;
            }
            .mail .column td.nine {
                width: 75% !important;
            }
            .mail .columns td.ten {
                width: 83.333333% !important;
            }
            .mail .column td.ten {
                width: 83.333333% !important;
            }
            .mail .columns td.eleven {
                width: 91.666666% !important;
            }
            .mail .column td.eleven {
                width: 91.666666% !important;
            }
            .mail .columns td.twelve {
                width: 100% !important;
            }
            .mail .column td.twelve {
                width: 100% !important;
            }
            .mail td.offset-by-eleven {
                padding-left: 0 !important;
            }
            .mail td.offset-by-ten {
                padding-left: 0 !important;
            }
            .mail td.offset-by-nine {
                padding-left: 0 !important;
            }
            .mail td.offset-by-eight {
                padding-left: 0 !important;
            }
            .mail td.offset-by-seven {
                padding-left: 0 !important;
            }
            .mail td.offset-by-six {
                padding-left: 0 !important;
            }
            .mail td.offset-by-five {
                padding-left: 0 !important;
            }
            .mail td.offset-by-four {
                padding-left: 0 !important;
            }
            .mail td.offset-by-three {
                padding-left: 0 !important;
            }
            .mail td.offset-by-two {
                padding-left: 0 !important;
            }
            .mail td.offset-by-one {
                padding-left: 0 !important;
            }
            .mail table.columns td.expander {
                width: 1px !important;
            }
            .mail .right-text-pad {
                padding-left: 10px !important;
            }
            .mail .text-pad-right {
                padding-left: 10px !important;
            }
            .mail .left-text-pad {
                padding-right: 10px !important;
            }
            .mail .text-pad-left {
                padding-right: 10px !important;
            }
            .mail .hide-for-small {
                display: none !important;
            }
            .mail .show-for-desktop {
                display: none !important;
            }
            .mail .show-for-small {
                display: block !important; width: auto !important; overflow: visible !important;
            }
            .mail .hide-for-desktop {
                display: block !important; width: auto !important; overflow: visible !important;
            }
            .mail .hide-and-true {
                display: none;
            }
            .mail .hide-and-false {
                display: block !important;
            }
            .mail .hide-or-true {
                display: none !important;
            }
        }
    </style>
</head>

<body style=\"width: 100% !important; min-width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; text-align: left; line-height: 1.3; background: #ffffff repeat center top; margin: 0; padding: 0;\"
      bgcolor=\"#ffffff\">
<table class=\"mail\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; height: 100%; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; line-height: 1.3; background: #ffffff repeat center top; margin: 0; padding: 0;\"
       bgcolor=\"#ffffff\">
    <tbody>
    <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
        <td align=\"center\" class=\"center\" valign=\"top\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: center; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\">
            <center style=\"width: 100%; min-width: 580px;\">
                <table class=\"container\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: inherit; max-width: 580px; margin: 0 auto; padding: 0;\">
                    <tbody>
                    <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                        <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                            align=\"left\" valign=\"top\">
                            <table class=\"row\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; position: relative; display: block; background: transparent repeat center top; padding: 0px;\" bgcolor=\"transparent\">
                                <tbody>
                                <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                    <td class=\"wrapper first \" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px 20px 0px 0px;\"
                                        align=\"left\" valign=\"top\">
                                        <table class=\"four columns\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 180px; margin: 0 auto; padding: 0;\">
                                            <tbody>
                                            <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                                    align=\"left\" valign=\"top\">
                                                    <!--[if mso]>
                                                    <table align='left' style='border-collapse: collapse; border-spacing: 0; overflow: hidden; border: 0; width: 100%; '>
                                                        <tr>
                                                            <td align='left' style='padding: 40px 0px 0px 10px;'>
                                                                <img alt='Logotype(1).png' src='https://app.makemail.ru/content/19b97c21ed81f16b6fc47cf379069b4a.png' width='32'>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <![endif]-->
                                                    <!--[if !mso]>
                                <!---->
                                                    <div align=\"left\" style=\"padding: 40px 0px 0px 10px;\">
                                                        <img alt=\"Logotype(1).png\" class=\"left\" height=\"32\" src=\"https://app.makemail.ru/content/19b97c21ed81f16b6fc47cf379069b4a.png\" style=\"width: 32px !important; height: 32px; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 100%; float: left; clear: both; display: block;\"
                                                             width=\"32\" align=\"left\">
                                                    </div>
                                                    <div class=\"clearfix\" style=\"clear: both;\"></div>
                                                    <!-- <![endif]-->
                                                    <!--[endif]---->


                                                </td>
                                                <td class=\"expander\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; visibility: hidden; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                                                    align=\"left\" valign=\"top\"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td class=\"wrapper\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px 20px 0px 0px;\"
                                        align=\"left\" valign=\"top\">
                                        <table class=\"four columns\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 180px; margin: 0 auto; padding: 0;\">
                                            <tbody>
                                            <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                                    align=\"left\" valign=\"top\">

                                                </td>
                                                <td class=\"expander\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; visibility: hidden; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                                                    align=\"left\" valign=\"top\"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td class=\"wrapper last\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                        align=\"left\" valign=\"top\">
                                        <table class=\"four columns\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 180px; margin: 0 auto; padding: 0;\">
                                            <tbody>
                                            <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                                    align=\"left\" valign=\"top\">

                                                </td>
                                                <td class=\"expander\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; visibility: hidden; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                                                    align=\"left\" valign=\"top\"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>

                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table class=\"container\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: inherit; max-width: 580px; margin: 0 auto; padding: 0;\">
                    <tbody>
                    <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                        <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                            align=\"left\" valign=\"top\">
                            <table class=\"row\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; position: relative; display: block; background: transparent repeat center top; padding: 0px;\" bgcolor=\"transparent\">
                                <tbody>
                                <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                    <td class=\"wrapper first last\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                        align=\"left\" valign=\"top\">
                                        <table class=\"twelve columns\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 580px; margin: 0 auto; padding: 0;\">
                                            <tbody>
                                            <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                                    align=\"left\" valign=\"top\">
                                                    <table class=\"table-block\" width=\"100%\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; padding: 0;\">
                                                        <tbody>
                                                        <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                            <td class=\"\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; background: transparent repeat center center; margin: 0; padding: 50px 10px 0px;\"
                                                                align=\"left\" bgcolor=\"transparent\" valign=\"top\">
                                                                <p style=\"text-align: left; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; line-height: 1.3; margin: 0 0 10px; padding: 0;\" align=\"left\"><span style=\"font-size: 17px;\">$message</span></p>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>


                                                </td>
                                                <td class=\"expander\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; visibility: hidden; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                                                    align=\"left\" valign=\"top\"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>

                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table class=\"container\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: inherit; max-width: 580px; margin: 0 auto; padding: 0;\">
                    <tbody>
                    <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                        <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                            align=\"left\" valign=\"top\">
                            <table class=\"row\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; position: relative; display: block; background: transparent repeat center top; padding: 0px;\" bgcolor=\"transparent\">
                                <tbody>
                                <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                    <td class=\"wrapper first last\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                        align=\"left\" valign=\"top\">
                                        <table class=\"twelve columns\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 580px; margin: 0 auto; padding: 0;\">
                                            <tbody>
                                            <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                                    align=\"left\" valign=\"top\">
                                                    <table class=\"table-block\" width=\"100%\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; padding: 0;\">
                                                        <tbody>
                                                        <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                            <td class=\"\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; background: transparent repeat center center; margin: 0; padding: 60px 0px 0px;\"
                                                                align=\"left\" bgcolor=\"transparent\" valign=\"top\">
                                                                <div style=\"display:flex;width:100%;background:#E6E9ED50;border-radius:24px;padding-top:64px;padding-bottom:64px\">
                                                                                            <span style=\"margin-left: 18px; margin-right: 18px;font-weight: 400; font-size: 17px; line-height: 21px;\">
    Так же эти сообщения можно получать в <a href=\"https://t.me/atmagurubot?start=1\" style=\"color: #1790ff; text-decoration: none;\">Телеграм боте</a>
  </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>


                                                </td>
                                                <td class=\"expander\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; visibility: hidden; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                                                    align=\"left\" valign=\"top\"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>

                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table class=\"container\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: inherit; max-width: 580px; margin: 0 auto; padding: 0;\">
                    <tbody>
                    <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                        <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                            align=\"left\" valign=\"top\">
                            <table class=\"row\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; position: relative; display: block; background: transparent repeat center top; padding: 0px;\" bgcolor=\"transparent\">
                                <tbody>
                                <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                    <td class=\"wrapper first last\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                        align=\"left\" valign=\"top\">
                                        <table class=\"twelve columns\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 580px; margin: 0 auto; padding: 0;\">
                                            <tbody>
                                            <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0px;\"
                                                    align=\"left\" valign=\"top\">
                                                    <table width=\"100%\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; padding: 0;\">
                                                        <tbody>
                                                        <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                            <td style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 32px 10px 0px;\"
                                                                align=\"left\" valign=\"top\">
                                                                <div class=\"left social\" style=\"text-align: left;\" align=\"left\">
                                                                    <a href=\"https://t.me/atmaguru_official\" style=\"padding-right: 5px; text-decoration: none; color: #1790ff;\">
                                                                        <img alt=\"\" src=\"https://app.makemail.ru/content/95216b9caeffe4243ba59c16acf13aca.png\" style=\"outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; width: auto; max-width: 100%; float: inherit; clear: both; display: inline; border: none;\"
                                                                             align=\"inherit\">
                                                                    </a>
                                                                    <!--[if mso]>
                                                                    &nbsp;
                                                                    <![endif]-->
                                                                    <a href=\"https://vk.com/atmaguru\" style=\"padding-right: 5px; text-decoration: none; color: #1790ff;\">
                                                                        <img alt=\"\" src=\"https://app.makemail.ru/content/71a7ebd51934bf4890385310ffaa8842.png\" style=\"outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; width: auto; max-width: 100%; float: inherit; clear: both; display: inline; border: none;\"
                                                                             align=\"inherit\">
                                                                    </a>
                                                                    <!--[if mso]>
                                                                    &nbsp;
                                                                    <![endif]-->
                                                                    <a href=\"https://zen.yandex.ru/atmaguru\" style=\"padding-right: 5px; text-decoration: none; color: #1790ff;\">
                                                                        <img alt=\"\" src=\"https://app.makemail.ru/content/a7c396f8324278f78c774920b6d769c1.png\" style=\"outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; width: auto; max-width: 100%; float: inherit; clear: both; display: inline; border: none;\"
                                                                             align=\"inherit\">
                                                                    </a>
                                                                    <!--[if mso]>
                                                                    &nbsp;
                                                                    <![endif]-->
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>

                                                    <table class=\"table-block\" width=\"100%\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; padding: 0;\">
                                                        <tbody>
                                                        <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                            <td class=\"\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; background: transparent repeat center center; margin: 0; padding: 32px 10px 0px;\"
                                                                align=\"left\" bgcolor=\"transparent\" valign=\"top\">
                                                                <div style=\"font-size: 17px; color: #AAB2BD; line-height: 21px;\">Вы получили это письмо, потому что вы зарегистрировались в системе atmaguru.online</div>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>

                                                    <table class=\"table-block\" width=\"100%\" style=\"border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; padding: 0;\">
                                                        <tbody>
                                                        <tr style=\"vertical-align: top; text-align: left; padding: 0;\" align=\"left\">
                                                            <td class=\"\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; background: transparent repeat center center; margin: 0; padding: 18px 10px 40px;\"
                                                                align=\"left\" bgcolor=\"transparent\" valign=\"top\">
                                                                <a href=\"\" style=\"color: #1790FF; font-weight: 500; font-size: 17px; line-height: 21px; text-decoration: underline;\">Отписаться</a>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>


                                                </td>
                                                <td class=\"expander\" style=\"word-break: break-word; -webkit-hyphens: none; -moz-hyphens: none; hyphens: none; border-collapse: collapse !important; vertical-align: top; text-align: left; width: 100%; visibility: hidden; color: #1d1d1f; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 14px; margin: 0; padding: 0;\"
                                                    align=\"left\" valign=\"top\"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>

                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>

            </center>
        </td>
    </tr>
    </tbody>
</table>




</body>

</html>
        ";
    }

    static public function sendEmail(MailerInterface $mailer, $message, $subject = "Новый отзыв", $tomail = "bumblebeelion@atma.company", $bcc = "yakov@atmapro.ru")
    { // damedvedev@atmapro.ru  bumblebeelion@atma.company  atmaguru@atmadev.ru
        if (!empty($message)) {
            //Заменяет текст ссылки в тексте на <a href=""></a>
            $text = preg_replace('(https://[\w+?\.\w+]+[a-zA-Z0-9\~\!\@\#\$\%\^\&amp;\*\(\)_\-\=\+\\\/\?\:\;\'\.\/]+[\.]*[a-zA-Z0-9\/]+)', "<a href='$0' target='_blank'>$0</a>", $message);

            $email = (new Email())
                ->from($_ENV['MAILER_FROM'])
                ->to($tomail)
                ->bcc($bcc)
                ->subject($subject)
//                ->text($message);
//                ->attachFromPath($filepath . $filename, 'qrcode')
                ->html(AppController::mailPattern($text));

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
