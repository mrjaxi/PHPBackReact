<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\AppAuthenticator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
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

    /**
     * @Route("/redirect")
     * @param Request $request
     * @return Response
     */
    public function auto_redirect(Request $request): Response
    {
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
            // TODO: сделать авторизацию под аккаунтом через код
//            $this->redirectToRoute("app_login", array(
//                'username' => $email,
//                'password' => $password,
//                'remember' => 1
//            ));
        }
        // TODO: сделать чтобы переход на redirectToRoute был с параметрами(к конкретной идее)
        return $this->redirect($url);
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
