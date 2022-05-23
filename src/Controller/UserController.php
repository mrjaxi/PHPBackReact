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
    private UserRepository $userRepository;
    private UserPasswordEncoderInterface $encoder;

    public function __construct(UserRepository $userRepository, UserPasswordEncoderInterface $encoder)
    {
        $this->userRepository = $userRepository;
        $this->encoder = $encoder;
    }

    /**
     * @Route("/api/web/signIn/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function signIn(Request $request, MailerInterface $mailer): Response
    {


    }

    /**
     * @Route("/api/ag/register/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function register(Request $request, MailerInterface $mailer): Response
    {
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            if (empty($data['usersData'])) {
                return $this->json(['state' => 'error', 'message' => "Передайте данные новых пользователей"]);
            }
            $usersData = json_decode($data['usersData'], true);
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте данные новых пользователей"]);
        }

        $exists = [];
        $added = [];
        foreach ($usersData as $user) {
            $email = $user['email'] ?: null;
            $pass = $user['pass'] ?: null;
            $name = !empty($user['name']) ? $user['name'] : "Незнакомец";
            $image = !empty($user['image']) ? $user['image'] : null;
            $systemId = !empty($user['system_id']) ? $user['system_id'] : null;
            if (empty($email) or empty($pass)) {
                return $this->json(["state" => "error", "message" => "Не отправлены поля pass или email"]);
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
        $response = array('state' => count($exists) ? 'trouble' : 'success');
        if (count($exists) || count($added)) {
            count($exists) ? $response += ['exists' => $exists] : null;
            count($added) ? $response += ['added' => $added] : null;
        }
        return $this->json($response);
    }

    /**
     * @Route("/api/ag/user/setUsername/")
     * @param Request $request
     * @return Response
     */
    public function setUsername(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['email']) or empty($data['first_name'])) {
            return $this->json(['state' => 'error', 'message' => "Передайте email и Имя. Опционально Фамилию и Отчество"]);
        }
        /* @var User */
        $user = $this->userRepository->findOneBy(['email' => $data['email']]);
        if (empty($user)) {
            return $this->json(['state' => 'error', 'message' => "Такого пользователя не существует"]);
        }

        $user->setFirstName($data['first_name']);
        if (!empty($data['middle_name'])) {
            $user->setMiddleName($data['middle_name']);
        }
        if (!empty($data['last_name'])) {
            $user->setLastName($data['last_name']);
        }
        $this->userRepository->save($user);

        return $this->json(['state' => 'success', 'message' => "Имя пользователя успешно изменено"]);
    }

    /**
     * @Route("/api/web/profile/")
     * @param Request $request
     * @return Response
     */
    public function getProfile(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
//        dd($user);
        if (!empty($user)) {
            return $this->json(['state' => 'success', 'profile' => $user->get_Profile()]);
        } else {
            return Response::create('UNAUTHORIZED', Response::HTTP_UNAUTHORIZED);
        }
    }
    /**
     * @Route("/api/ag/user/setProfile/")
     * @param Request $request
     * @return Response
     */
    public function setProfile(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['email']) or empty($data['first_name']) or empty($data['username'])) {
            return $this->json(['state' => 'error', 'message' => "Передайте email, username, first_name"]);
        }

        /** @var User $user */
        $user = $this->userRepository->findOneBy(["email" => $data['email']]);
        if (empty($user)) {
            return $this->json(['state' => 'error', 'message' => "Такого пользователя не существует"]);
        }

        $user->setEmail($data['email'])
            ->setUsername($data['username'])
            ->setFirstName($data['first_name']);
        if (!empty($data['middle_name'])) {
            $user->setMiddleName($data['middle_name']);
        }
        if (!empty($data['last_name'])) {
            $user->setLastName($data['last_name']);
        }
        if (!empty($data['image'])) {
            $user->setImage($data['image']);
        }
        if (!empty($data['phone'])) {
            $user->setPhone($data['phone']);
        }
        if (!empty($data['pass'])) {
            $user->setPassword($this->encoder->encodePassword($user, $data['pass']))
                ->setOpenPassword($data['pass']);
        }
        $this->userRepository->save($user);

        return $this->json(['state' => 'success', 'profile' => $user->get_Profile()]);
    }

    /**
     * @Route("/api/web/user/{id}/")
     * @param Request $request
     * @param $id
     * @return Response
     */
    public function getUserProfile(Request $request, $id): Response
    {
        /* @var User */
        $user = $this->userRepository->find($id);
        if (empty($user)) {
            return $this->json(['state' => 'error', 'message' => "Такого пользователя нет"]);
        }
        $data = json_decode($request->getContent(), true);
        if (empty($data['page'])) {
            return $this->json(['state' => 'error', 'message' => "Передайте параметр page"]);
        }
        $response = array(
            'state' => 'success',
            'profile' => $user->get_Profile(),
        );
        switch ($data['page']) {
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
                return $this->json(['state' => 'error', 'message' => "Неизвестная вкладка"]);
                break;
        }

        return $this->json($response);
    }
}
