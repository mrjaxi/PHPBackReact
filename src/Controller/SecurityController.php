<?php

namespace App\Controller;

use App\Entity\User;
use phpDocumentor\Reflection\DocBlock\Tags\Var_;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Guard\GuardAuthenticatorHandler;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Security\AppAuthenticator;

class SecurityController extends AbstractController
{
    private $guardHandler;

    public function __construct(GuardAuthenticatorHandler $guardHandler)
    {
        $this->guardHandler = $guardHandler;
    }

    /**
     * @Route("/signup", name="app_signup")
     */
    public function signup(AuthenticationUtils $authenticationUtils, Request $request, UserPasswordEncoderInterface $encoder, AppAuthenticator $authenticator): Response
    {
        $em = $this->getDoctrine()->getManager();
        $json = ['state' => 'error', 'message' => 'Ошибка регистрации'];

        if ($request->getMethod() == 'POST') {
            $data = json_decode($request->getContent(), true);
            if(empty($data)){
//                return var_dump("data null");
                $username = $request->get('username');
                $first_name = $request->get('first_name');
                $last_name = $request->get('last_name');
                $phone = $request->get('phone');
                $password = $request->get('password');
            } else {
//                var_dump("data");
//                return var_dump($data);
                $username = $data['username'];
                $first_name = $data['first_name'];
                $last_name = $data['last_name'];
                $phone = $data['phone'];
                $password = $data['password'];
            }

            if ($password != "undefined" && !empty($password) && $username != "username" && !empty($username)) {
                $user = $this->getDoctrine()
                    ->getRepository(User::class)
                    ->findOneByUsername($username);

                if (!$user) {
                    $newUser = new User();
                    $newUser->setUsername($username);

                    $encoded = $encoder->encodePassword($newUser, $password);

                    $newUser->setPassword($encoded);
                    $newUser->setRoles(array('ROLE_ADMIN', 'ROLE_MENTOR'));
                    $newUser->setFirstName($first_name);
                    $newUser->setLastName($last_name);
                    $newUser->setPhone($phone);
                    $newUser->setEmail($username);
                    $newUser->setOpenPassword($password);
                    $newUser->setIsActive(1);

                    $em->persist($newUser);
                    $em->flush();

                    if ($newUser) {
                        $user = $newUser;
                        $credentials = array(
                            'username' => $username,
                            'password' => $password
                        );
                        $is_check = $authenticator->checkCredentials($credentials, $user);

                        if ($is_check) {
                            $this->guardHandler->authenticateUserAndHandleSuccess(
                                $user,
                                $request,
                                $authenticator,
                                'main'
                            );
                        }

                        $json['state'] = 'success';
                        unset($json['message']);
                    }
                } else {
                    $json['message'] = 'Пользователь с таким логином уже сущесвует';
                }
            } else {
                $json['message'] = 'Заполните обязательные поля для заполнения';
            }
        }
        return $this->json($json);
    }


    /**
     * @Route("/login", name="app_login")
     */
    public function login(AuthenticationUtils $authenticationUtils, Request $request, UserPasswordEncoderInterface $encoder): Response
    {

//        if (!$request->isXmlHttpRequest()) {
//            return $this->redirect('/');
//        }

        if ($this->getUser()) {
            return $this->json(['state' => 'success', 'profile' => $this->getUser()->get_Profile()]);
        }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        $message = '';
        if ($error) {
            $message = $error->getMessage();
        }
        if ($message === 'Credentials check failed as the callable passed to CustomCredentials did not return "true".') {
            $message = 'Неверный логин или пароль';
        }
        return $this->json(['state' => 'error', 'message' => $message]);
    }

    /**
     * @Route("/logout", name="app_logout")
     */
    public function logout()
    {
        return $this->json(['state' => 'success']);
    }
}
