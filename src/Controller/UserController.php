<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Exception;
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
                    throw new Exception("Передайте данные новых пользователей");
                }
                $usersData = json_decode($data['usersData'], true);
            } else {
                $users_data = $request->get('usersData');
                if (empty($users_data)) {
                    throw new Exception("Передайте данные новых пользователей");
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
                $systemId = !empty($user['system_id']) ? $user['system_id'] : null;
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
                        ->setImage($image)
                        ->setSystemId($systemId);
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
        } catch (Exception $e){
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
                $first_name = $data['first_name'];
                $middle_name = $data['middle_name'];
                $last_name = $data['last_name'];
            } else {
                $email = $request->get('email');
                $first_name = $data['first_name'];
                $middle_name = $data['middle_name'];
                $last_name = $data['last_name'];
            }
            if (empty($email) or empty($first_name)) {
                throw new Exception('Передайте email, first_name');
            }
            /* @var User */
            $user = $this->userRepository->findOneBy(['email' => $email]);
            if(empty($user)){
                throw new Exception("Такого пользователя не существует");
            }
            $user->setFirstName($first_name);
            if(!empty($middle_name)) {
                $user->setMiddleName($middle_name);
            }
            if(!empty($last_name)) {
                $user->setLastName($last_name);
            }
            $this->userRepository->save($user);

            return $this->json(['state' => 'success', 'message' => "Имя пользователя успешно изменено"]);
        } catch (Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/api/profile/", name="api_profile")
     * @param Request $request
     * @return Response
     */
    public function getProfile(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($user) {
            return $this->json(['state' => 'success', 'profile' => $user->get_Profile()]);
        }

        return Response::create('UNAUTHORIZED', Response::HTTP_UNAUTHORIZED);

    }
    /**
     * @Route("/api/user/setProfile/")
     * @param Request $request
     * @return Response
     */
    public function setProfile(Request $request): Response
    {
        try {
            $data = json_decode($request->getContent(), true);
            if ($data) {
                $email = $data['email'];
                $username = $data['username'];
                $first_name = $data['first_name'];
                $middle_name = $data['middle_name'];
                $last_name = $data['last_name'];
                $image = $data['image'];
                $phone = $data['phone'];
            } else {
                $email = $request->get('email');
                $username = $request->get('username');
                $first_name = $request->get('first_name');
                $middle_name = $request->get('middle_name');
                $last_name = $request->get('last_name');
                $image = $request->get('image');
                $phone = $request->get('phone');
            }
            if (empty($email) or empty($first_name) or empty($username)) {
                throw new Exception('Передайте email, username, first_name');
            }
            /** @var User $user */
            $user = $this->userRepository->findOneBy(["email"=>$email]);
            if(empty($user)){
                throw new Exception('Такого пользователя не существует');
            }

            $user->setEmail($email)
                ->setUsername($username)
                ->setFirstName($first_name);
            if(!empty($middle_name)){
                $user->setMiddleName($middle_name);
            }
            if(!empty($last_name)){
                $user->setLastName($last_name);
            }
            if(!empty($image)){
                $user->setImage($image);
            }
            if(!empty($phone)){
                $user->setPhone($phone);
            }
            $this->userRepository->save($user);

            return $this->json(['state' => 'success', 'profile' => $user->get_Profile()]);
        } catch (Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/api/users/{id}/", name="api_user_get")
     * @param Request $request
     * @return Response
     */
    public function getUserProfile(Request $request): Response
    {
        try {
            /* @var User */
            $user = $this->userRepository->find($request->get('id'));
            if(empty($user)){
                throw new Exception("Такого пользователя нет");
            }
            $data = json_decode($request->getContent(), true);
            if ($data) {
                $page = (int) $data['page'];
            } else {
                $page = (int) $request->get('page');
            }
            if(empty($page)){
                throw new Exception("Передайте параметр page");
            }
            $response = array(
                'state' => 'success',
                'profile' => $user->get_Profile(),
            );
            switch ($page){
                case 1:
                    $ideas = $user->get_IdeasArray();
                    $response["ideas"] = $ideas;
                    break;
                case 2:
                    $comments = $user->get_CommentsArray();
                    $response["comments"] = $comments;
                    break;
                case 3:
                    $likes = $user->get_VotesArray();
                    $response["likes"] = $likes;
                    break;
                default:
                    throw new Exception("Неизвестная вкладка");
                    break;
            }

            return $this->json($response);
        } catch (Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
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
