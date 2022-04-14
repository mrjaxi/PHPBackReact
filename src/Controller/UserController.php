<?php

namespace App\Controller;

use App\Entity\Division;
use App\Entity\Map;
use App\Entity\MapRelations;
use App\Entity\Post;
use App\Entity\Result;
use App\Repository\ResultRepository;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Message;
use Symfony\Component\Security\Core\Authentication\AuthenticationManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;

class UserController extends AbstractController
{
    /**
     * @var TokenStorageInterface
     */
    private $tokenStorage;

    /**
     * @var AuthenticationManagerInterface
     */
    private $authenticationManager;

    /**
     * @var string Uniquely identifies the secured area
     */
    private $providerKey;


    /**
     * @Route("/api/profile/", name="api_profile")
     */
    public function profile(Request $request): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->redirect('/');
        }

        if ($this->getUser()) {
            return $this->json(['state' => 'success', 'profile' => $this->getUser()->getProfile()]);
        }

        return Response::create('UNAUTHORIZED', Response::HTTP_UNAUTHORIZED);

    }

    /**
     * @Route("/api/user/account/", name="api_user_account")
     */
    public function userAccount(Request $request): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->redirect('/');
        }

        if ($this->getUser()) {
            $json = array('state' => 'success');
            if ($request->get('countAccount')) {
                $json['count'] = count($this->getUser()->getSystems());
            } else {
                $json['account'] = array(
                    'id' => $this->getUser()->getId(),
                    'username' => $this->getUser()->getUsername(),
                    'first_name' => $this->getUser()->getFirstName(),
                    'middle_name' => $this->getUser()->getMiddleName(),
                    'last_name' => $this->getUser()->getLastName(),
                    'image' => $this->getUser()->getImage(),
                    'email' => $this->getUser()->getEmail()
                );
            }

            return $this->json($json);
        }

        return Response::create('UNAUTHORIZED', Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/api/admin/user-list/", name="api_user_list")
     */
    public function userList(Request $request): Response
    {
//        echo "<pre>";
//        print_r($this->getDoctrine()->getRepository(User::class)->getUserList($request->get('admin') ? 'ROLE_ADMIN' : 'ROLE_USER'));
//        echo "</pre>";
//        die();
        return $this->json([
            'state' => 'success',
            'data' => $this->getDoctrine()->getRepository(User::class)->getUserList($request->get('admin') ? 'ROLE_ADMIN' : 'ROLE_USER', $request->get('disable'))
        ]);
    }

    /**
     * @Route("/api/admin/users/save/{id}/", name="api_user_save")
     */
    public function saveUser(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $em = $this->getDoctrine()->getManager();
        $user = $this->getDoctrine()->getRepository(User::class)->find($request->get('id'));
        if ($request->get('avatar')) {
            $user->setImage($data['avatar']);
            $em->persist($user);
        } else {
            $data = $data['values'];
            $data['roles'] = array_unique($data['roles']);
            $post = is_numeric($data['post']) ? $this->getDoctrine()->getRepository(Post::class)->find($data['post']) : false;
            $division = is_numeric($data['division']) ? $this->getDoctrine()->getRepository(Division::class)->find($data['division']) : false;

            $user->setUsername($data['username'])
                ->setFirstName($data['first_name'])
                ->setLastName($data['last_name'])
                ->setRoles($data['roles']);

            $old_post = false;
            $old_division = false;

            if ($post) {
                //Назначение по должности
                if ($user->getPost() == null || ($user->getPost() != null && $user->getPost()->getId() != $post->getId())) {
                    if ($user->getPost() != null) {
                        $old_relations = $this->getDoctrine()->getRepository(MapRelations::class)->findBy(['post' => $user->getPost(), 'division' => null, 'user' => null]);
                        $em = ResultRepository::delResultByRelations($em, $old_relations, $user);
                    }
                    $old_post = $user->getPost();
                    $user->setPost($post);

                    $relations = $this->getDoctrine()->getRepository(MapRelations::class)->findBy(['post' => $post, 'division' => null, 'user' => null]);
                    ResultRepository::createResultsByRelations($em, $relations);
                }
            }
            if ($division) {
                //Назначение по отделу
                if ($user->getDivision() == null || ($user->getDivision() != null && $user->getDivision()->getId() != $division->getId())) {
                    if ($user->getDivision() != null) {
                        $old_relations = $this->getDoctrine()->getRepository(MapRelations::class)->findBy(['post' => null, 'division' => $user->getDivision(), 'user' => null]);
                        $em = ResultRepository::delResultByRelations($em, $old_relations, $user);
                    }

                    $old_division = $user->getDivision();
                    $user->setDivision($division);
                    $relations = $this->getDoctrine()->getRepository(MapRelations::class)->findBy(['post' => null, 'division' => $division, 'user' => null]);
                    ResultRepository::createResultsByRelations($em, $relations);
                }
                $user->setDivision($division);
            }

            if ($user->getPost() && $user->getDivision()) {
                if ($old_post || $old_division) {
                    $old_relations = $this->getDoctrine()->getRepository(MapRelations::class)->findBy(['post' => $old_post ?: $user->getPost(), 'division' => $old_division ?: $user->getDivision(), 'user' => null]);
                    $em = ResultRepository::delResultByRelations($em, $old_relations, $user);
                }

                $relations = $this->getDoctrine()->getRepository(MapRelations::class)->findBy(['post' => $user->getPost(), 'division' => $user->getDivision(), 'user' => null]);
                ResultRepository::createResultsByRelations($em, $relations);
            }
            $em->persist($user);
        }

        $em->flush();
        return $this->json([
            'state' => 'success'
        ]);
    }

    function randomPassword()
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

    /**
     * @Route("/api/admin/users/{id}/", name="api_user_get")
     */
    public function getUserProfile(Request $request): Response
    {
        $user = $this->getDoctrine()->getRepository(User::class)->findByIdToArray($request->get('id'));

        return $this->json([
            'state' => 'success',
            'profile' => $user
        ]);
    }

    /**
     * @Route("/api/admin/users/get-maps/{id}/", name="api_user_get_maps")
     */
    public function getMaps(Request $request): Response
    {
        $user = $this->getDoctrine()->getRepository(User::class)->find($request->get('id'));

        if ($user) {
            $result = $this->getDoctrine()->getRepository(Result::class)->getResultUser($user->getId());

            $map_arr = [];
            if (count($result)) {

                foreach ($result as $key => $res) {
                    $map_arr[$key] = [
                        'key' => $res['id'],
                        'title' => $res['id'] . ';' . $res['title'],
                        'permission' => 1,
                        'progress' => $res['percent'],
                        'last_login' => date('Y-m-d H:i:s')
                    ];
                }
            }
            return $this->json([
                'state' => 'success',
                'items' => $map_arr
            ]);
        }
        return $this->json([
            'state' => 'error'
        ]);
    }

    /**
     * @Route("/api/admin/users/new/", name="api_user_new")
     */
    public function newUsers(Request $request, UserPasswordEncoderInterface $encoder, MailerInterface $mailer): Response
    {
        $em = $this->getDoctrine()->getManager();
        $data = json_decode($request->getContent(), true);
        $data = $data['values'];
        $count_users = $em->getRepository(User::class)->getCountUsers();
        $count_users++;

        $trouble_emails = [];

        if (isset($data['users']) && count($data['users'])) {
            foreach ($data['users'] as $user_d) {
                $check = $this->getDoctrine()->getRepository(User::class)->findOneBy(['email' => $user_d['email']]);
                if (!$check) {
                    $password = $this->randomPassword();
                    $User = new User();
                    $User->setUsername($user_d['email'])
                        ->setPassword($encoder->encodePassword($User, $password))
                        ->setOpenPassword($password)
                        ->setEmail($user_d['email'])
                        ->setFirstName($user_d['name'])
                        ->setRoles(['ROLE_USER', 'ROLE_ADMIN'])
                        ->setIsActive(1);
                    $em->persist($User);

                    $this->sendEmail(['to' => $user_d['email'], 'login' => $user_d['email'], 'password' => $password], $mailer);
                    $count_users++;
                } else {
                    $trouble_emails[] = $user_d['email'];
                }
            }
            $em->flush();

            if (count($trouble_emails)) {
                return $this->json(['state' => 'trouble', 'trouble_emails' => $trouble_emails]);
            } else {
                return $this->json(['state' => 'success']);
            }
        }
        return $this->json(['state' => 'error']);
    }

    public function sendRepeatLoginURL(Request $request, MailerInterface $mailer)
    {
        $email = $request->get('email');
        if ($email) {
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['email' => $email]);
            if ($user) {
                $this->sendEmail(['to' => $email, 'login' => $user->getLogin(), 'password' => $user->getOpenPassword()], $mailer);
                return $this->json(['state' => 'success']);
            } else {
                return $this->json(['state' => 'error', 'message' => 'User not found']);
            }
        }
        return $this->json(['state' => 'error']);
    }

    public function viewQr(Request $request)
    {
        $user = $this->getDoctrine()->getRepository(User::class)->find($request->get('user_id'));
        if ($user) {
            echo '<img src="' . (new QRCode(new QROptions([
                    'version' => 5,
                    'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                    'eccLevel' => QRCode::ECC_L,
                ])))->render('https://ag.atmadev.ru/login-app/' . strtr(base64_encode($user->getUsername() . ':' . $user->getOpenPassword()), '+/=', '._-') . '/') .
                '" />';
        }
        return $this->render('login-app.html.twig', [
            'controller_name' => 'UserController',
        ]);
    }

    function sendEmail($data, MailerInterface $mailer)
    {
        if ($data) {
            $filepath = $this->getParameter('kernel.project_dir') . '/public/qr/' . mb_substr(sha1($data['login']), 0, 8) . '/';
            $filename = mb_substr(md5($data['login']), 0, 8) . '.png';

            if (!is_dir($filepath)) {
                mkdir($filepath);
            }

            (new QRCode(new QROptions([
                'version' => 5,
                'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                'eccLevel' => QRCode::ECC_L,
            ])))->render('https://ag.atmadev.ru/login-app/' . strtr(base64_encode($data['login'] . ':' . $data['password']), '+/=', '._-') . '/', $filepath . $filename);

            if (file_exists($filepath . $filename)) {
                chmod($filepath . $filename, 0644);
            } else {
                return ['state' => 'error'];
            }

//            $html = '<p>scan QR Code</p>
//                    <br>
//                    <img width="300" height="300"
//                        src="https://ag.atmadev.ru/qr/' . mb_substr(sha1($data['login']), 0, 8) . '/' . $filename . '"
//                        alt="QR Code login"
//                    />
//                    <br>
//                    <p>or
//                        <a href="https://ag.atmadev.ru/login-app/' . strtr(base64_encode($data['login'] . ':' . $data['password']), '+/=', '._-') . '/">click this</a>
//                    </p>
//                    <br>
//                    or';
            $html = 'login: ' . $data['login'] . '<br/>password: ' . $data['password'];

            $email = (new Email())
                ->from('skillgro@mg.atma.company')
                ->to($data['to'])
                ->bcc('yakov@atmapro.ru')
                ->subject('You are registered on AtmaGuru')
                ->text('You login data')
//                ->attachFromPath($filepath . $filename, 'qrcode')
                ->html($html);

            try {
                $mailer->send($email);
            } catch (TransportExceptionInterface $e) {
                file_put_contents($this->getParameter('kernel.project_dir') . '/log/mail_error_log.txt', date('d-m-Y H:i:s') . ' ' . $e->getMessage() . "\n", FILE_APPEND);
                return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
            }
            return true;
        }
        return false;
    }

    public function upload(Request $request): Response
    {
        return $this->json(AppController::saveFile($request, $this->getParameter('kernel.project_dir') . '/public/' . $this->getParameter('app.name') . '/'));
    }

    public function disable(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $em = $this->getDoctrine()->getManager();
        if (isset($data['ids']) && count($data['ids']) > 0) {
            foreach ($data['ids'] as $id) {
                $user = $this->getDoctrine()->getRepository(User::class)->find($id);
                if ($user) {
                    $user->setIsActive(0);
                    $em->persist($user);
                }
            }
            $em->flush();
        }
        return $this->json([
            'state' => 'success',
            'data' => $this->getDoctrine()->getRepository(User::class)->getUserList($request->get('admin') ? 'ROLE_ADMIN' : 'ROLE_USER', $request->get('disable'))
        ]);
    }

    static public function generateUuid()
    {
        mt_srand((double)microtime() * 10000);
        $charid = strtolower(md5(uniqid(rand(), true)));
        $hyphen = chr(45);
        $uuid = substr($charid, 0, 8) . $hyphen . substr($charid, 8, 4) . $hyphen . substr($charid, 12, 4) . $hyphen . substr($charid, 16, 4) . $hyphen . substr($charid, 20, 12);
        return $uuid;
    }

}
