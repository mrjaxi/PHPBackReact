<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Guard\GuardAuthenticatorHandler;

class MainController extends AbstractController
{
    private $userRepository;
    private $encoder;
    private $guardHandler;

    public function __construct(UserRepository $userRepository, UserPasswordEncoderInterface $encoder, GuardAuthenticatorHandler $guardHandler)
    {
        $this->userRepository = $userRepository;
        $this->encoder = $encoder;
        $this->guardHandler = $guardHandler;
    }

    /**
     * @Route("/main", name="main")
     * @param Request $request
     * @return Response
     */
    public function index(Request  $request) : Response
    {
        return $this->render('main.html.twig');
    }
    public function setLocale(Request $request) : Response
    {
        if (!$request->getLocale()) {
            $request->setLocale('ru');
        }

        return $this->redirect('/' . $request->getLocale() . '/');

    }

    /**
     * @Route("/api/upload/")
     * @param Request $request
     * @return Response
     */
    public function upload(Request $request): Response
    {
        return $this->json(AppController::saveFile($request, $this->getParameter('kernel.project_dir') . '/public/' . $this->getParameter('app.name') . '/', $this->getDoctrine()->getManager()));
    }

//    /**
//     * @Route("/redirect")
//     * @param Request $request
//     * @return Response
//     */
    public function auto_redirect(Request $request): Response
    {
        // TODO: перевести редирект в реакт
        $url = $request->query->get('url');
        $userBase64 = $request->query->get('user');
        if (empty($userBase64) or empty($url)) {
            $this->redirect('/' . $request->getLocale() . '/');
        }

        $user = AppController::decodeBase64User($userBase64);
        $email = $user[0];
        $password  = $user[1];
        $isLogin = $this->checkAuth($email, $password);
        if($isLogin){
//            $this->redirectToRoute("app_login", array(
//                'username' => $email,
//                'password' => $password,
//                'remember' => 1
//            ));
        }
        return $this->redirect($url);
    }

    /**
     * @Route("/api/decode/user/")
     * @param Request $request
     * @return Response
     */
    public function decodeUserInfo(Request $request): Response
    {
        try {
            $data = json_decode($request->getContent(), true);
            if ($data) {
                $userBase64 = $data['user'];
            } else {
                $userBase64 = $request->get('user');
            }
            if (empty($userBase64)) {
                throw new Exception("Передайте закодированные данные пользователя");
            }
            $user = AppController::decodeBase64User($userBase64);
            $email = $user[0];
            $password  = $user[1];
            return $this->json([
                    "state" => "success",
                    "user" => array(
                        "username" => $email,
                        "password" => $password
                    )
                ]);
        } catch (Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @param string $email
     * @param string $pass
     * @return User|false
     */
    private function checkAuth($email, $pass)
    {
        /* @var User */
        $user = $this->userRepository->findOneBy(['email' => $email]);
        if(!empty($user)){
            if($user->getOpenPassword() === $pass)
                return $user;
            else
                return false;
        } else {
            return false;
        }
    }
}
