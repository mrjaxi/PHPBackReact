<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class UserController extends AbstractController
{
    private $userRepository;
    private $encoder;

    public function __construct(UserRepository $userRepository, UserPasswordEncoderInterface $encoder)
    {
        $this->userRepository = $userRepository;
        $this->encoder = $encoder;
    }

    // TODO: Регистрация через web
    // TODO: Авторизация через web

    /**
     * @Route("/api/user/new/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function newUser(Request $request, MailerInterface $mailer): Response
    {
//        if (!$request->isXmlHttpRequest()) {
//            return $this->redirect('/');
//        }
        try {
            $data = json_decode($request->getContent(), true);
            if (empty($data['usersData'])) {
                return $this->json(['state' => 'error', 'message' => 'Передайте данные новых пользователей']);
            }
            $usersData = json_decode($data['usersData'], true);

            $exists = [];
            $added = [];
            foreach ($usersData as $user) {
                $email = $user['email'] ?: null;
                $pass = $user['pass'] ?: null;
                $name = !empty($user['name']) ? $user['name'] : "Незнакомец";
                if (empty($email) or empty($pass)) {
                    return $this->json([
                        "state" => "error",
                        "message" => "Не отправлены поля pass или email",
                    ]);
                }

                $check = $this->userRepository->findOneBy(['email' => $email]);
                if (!$check) {
                    $User = new User();
                    $User->setUsername($email)
                        ->setPassword($this->encoder->encodePassword($User, $pass))
                        ->setOpenPassword($pass)
                        ->setEmail($email)
                        ->setFirstName($name)
                        ->setRoles(['ROLE_USER'])
                        ->setIsActive(true);
                    $this->userRepository->save($User);
                    $added[] = $email;
                } else {
                    $exists[] = $email;
                }
            }
            if (count($exists) || count($added)) {
                $response = array('state' => 'trouble');
                count($exists) ? $response += ['exists' => $exists] : null;
                count($added) ? $response += ['added' => $added] : null;
                return $this->json($response);
            } else {
                return $this->json(['state' => 'success']);
            }
        } catch (\RuntimeException $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/api/user/register/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function register(Request $request, MailerInterface $mailer): Response
    {
//        if (!$request->isXmlHttpRequest()) {
//            return $this->redirect('/');
//        }
        try {
            $data = json_decode($request->getContent(), true);
            if (empty($data['usersData'])) {
                return $this->json(['state' => 'error', 'message' => 'Передайте данные новых пользователей']);
            }
            $usersData = json_decode($data['usersData'], true);

            $exists = [];
            $added = [];
            foreach ($usersData as $user) {
                $email = $user['email'] ?: null;
                $pass = $user['pass'] ?: null;
                $name = !empty($user['name']) ? $user['name'] : "Незнакомец";
                if (empty($email) or empty($pass)) {
                    return $this->json([
                        "state" => "error",
                        "message" => "Не отправлены поля pass или email",
                    ]);
                }

                $check = $this->userRepository->findOneBy(['email' => $email]);
                if (!$check) {
                    $User = new User();
                    $User->setUsername($name)
                        ->setPassword($this->encoder->encodePassword($User, $pass))
                        ->setOpenPassword($pass)
                        ->setEmail($email)
                        ->setFirstName($name)
                        ->setRoles(['ROLE_USER'])
                        ->setIsActive(true);
                    $this->userRepository->save($User);
                    $added[] = $email;
                } else {
                    $exists[] = $email;
                }
            }
            if (count($exists) || count($added)) {
                $response = array('state' => 'trouble');
                count($exists) ? $response += ['exists' => $exists] : null;
                count($added) ? $response += ['added' => $added] : null;
                return $this->json($response);
            } else {
                return $this->json(['state' => 'success']);
            }
        } catch (\RuntimeException $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/api/user/setUsername/")
     * @param Request $request
     * @return Response
     */
    public function setUsername(Request $request): Response
    {
//        if (!$request->isXmlHttpRequest()) {
//            return $this->redirect('/');
//        }
        try {
            $data = json_decode($request->getContent(), true);
            if (empty($data['email']) || empty($data['name'])) {
                return $this->json(['state' => 'error', 'message' => 'Передайте email и name']);
            }
            $email = $data['email'];
            $newName = $data['name'];
            /* @var User */
            $user = $this->userRepository->findOneBy(['email' => $email]);
            if(!empty($user)){
                $user->setUsername($newName);
                $this->userRepository->save($user);
                return $this->json(['state' => 'success', 'message' => "Имя пользователя успешно изменено"]);
            } else {
                return $this->json(['state' => 'error', 'message' => "Такого пользователя не существует"]);
            }
        } catch (\RuntimeException $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

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
     * @Route("/api/user/upload/")
     * @param Request $request
     * @return Response
     */
    public function upload(Request $request): Response
    {
        return $this->json(AppController::saveFile($request, $this->getParameter('kernel.project_dir') . '/public/' . $this->getParameter('app.name') . '/', $this->getDoctrine()->getManager()));
    }

    /**
     * @Route("/api/users/{id}/", name="api_user_get")
     */
    public function getUserProfile(Request $request): Response
    {
        $user = $this->getDoctrine()->getRepository(User::class)->findByIdToArray($request->get('id'));

        return $this->json([
            'state' => 'success',
            'profile' => $user
        ]);
    }

//    /**
//     * @Route("/api/user/account/", name="api_user_account")
//     * @param Request $request
//     * @return Response
//     */
//    public function userAccount(Request $request): Response
//    {
//        if (!$request->isXmlHttpRequest()) {
//            return $this->redirect('/');
//        }
//
//        if ($this->getUser()) {
//            $json = array('state' => 'success');
//            $json['account'] = array(
//                'id' => $this->getUser()->getId(),
//                'username' => $this->getUser()->getUsername(),
//                'first_name' => $this->getUser()->getFirstName(),
//                'middle_name' => $this->getUser()->getMiddleName(),
//                'last_name' => $this->getUser()->getLastName(),
//                'image' => $this->getUser()->getImage(),
//                'email' => $this->getUser()->getEmail()
//            );
//
//
//            return $this->json($json);
//        }
//
//        return Response::create('UNAUTHORIZED', Response::HTTP_UNAUTHORIZED);
//    }
}
