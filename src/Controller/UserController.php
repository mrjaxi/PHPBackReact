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

    /**
     * @Route("/api/user/register/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function register(Request $request, MailerInterface $mailer): Response
    {
        try {
            $data = json_decode($request->getContent(), true);
            if (!empty($data)) {
                if (empty($data['usersData'])) {
                    return $this->json(['state' => 'error', 'message' => 'Передайте данные новых пользователей']);
                }
                $usersData = json_decode($data['usersData'], true);
            } else {
                $users_data = $request->get('usersData');
                if (empty($users_data)) {
                    return $this->json(['state' => 'error', 'message' => 'Передайте данные новых пользователей']);
                }
                $usersData = json_decode($users_data, true);
            }
//            dd($usersData);

            $exists = [];
            $added = [];
            foreach ($usersData as $user) {
                $email = $user['email'] ?: null;
                $pass = $user['pass'] ?: null;
                $name = !empty($user['name']) ? $user['name'] : "Незнакомец";
                $image = !empty($user['image']) ? $user['image'] : null;
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
                        ->setIsActive(true)
                        ->setImage($image);
                    $this->userRepository->save($User);
                    $added[] = $email;
                } else {
                    $exists[] = $email;
                }
            }
            if (count($exists) || count($added)) {
                $response = array('state' => count($exists) ? 'trouble' : 'success');
                count($exists) ? $response += ['exists' => $exists] : null;
                count($added) ? $response += ['added' => $added] : null;
                return $this->json($response);
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
        try {
            $data = json_decode($request->getContent(), true);
            if ($data) {
                $email = $data['email'];
                $newName = $data['name'];
            } else {
                $email = $request->get('email');
                $newName = $request->get('name');
            }
            if (empty($email) or empty($newName)) {
                return $this->json(['state' => 'error', 'message' => 'Передайте email и name']);
            }
            /* @var User */
            $user = $this->userRepository->findOneBy(['email' => $email]);
            if(!empty($user)){
                $user->setFirstName($newName);
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
     * @param Request $request
     * @return Response
     */
    public function profile(Request $request): Response
    {
        if ($this->getUser()) {
            return $this->json(['state' => 'success', 'profile' => $this->getUser()->get_Profile()]);
        }

        return Response::create('UNAUTHORIZED', Response::HTTP_UNAUTHORIZED);

    }

    /**
     * @Route("/api/users/{id}/", name="api_user_get")
     * @param Request $request
     * @return Response
     */
    public function getUserProfile(Request $request): Response
    {
        /* @var User */
        $user = $this->userRepository->find($request->get('id'));
        if(empty($user)){
            return $this->json([
                'state' => 'error',
                'message' => "Такого пользователя нет"
            ]);
        }

        return $this->json([
            'state' => 'success',
            'profile' => $user->get_Profile()
        ]);
    }

//    /**
//     * @Route("/api/user/setValue/")
//     * @param Request $request
//     * @return Response
//     */
//    public function setValue(Request $request): Response
//    {
//        try {
//            $data = json_decode($request->getContent(), true);
//            if ($data) {
//                $email = $data['email'];
//                $newName = $data['name'];
//            } else {
//                $email = $request->get('email');
//                $newName = $request->get('name');
//            }
//            if (empty($email) or empty($newName)) {
//                return $this->json(['state' => 'error', 'message' => 'Передайте email и name']);
//            }
//            $email = $data['email'];
//            $newName = $data['name'];
//            /* @var User */
//            $user = $this->userRepository->findOneBy(['email' => $email]);
//            if(!empty($user)){
//                $user->setUsername($newName);
//                $this->userRepository->save($user);
//                return $this->json(['state' => 'success', 'message' => "Имя пользователя успешно изменено"]);
//            } else {
//                return $this->json(['state' => 'error', 'message' => "Такого пользователя не существует"]);
//            }
//        } catch (\RuntimeException $e){
//            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
//        }
//    }
}
