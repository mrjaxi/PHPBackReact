<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\IdeasRepository;
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
    private UserRepository $userRepository;
    private UserPasswordEncoderInterface $encoder;
    private GuardAuthenticatorHandler $guardHandler;
    private IdeasRepository $ideasRepository;

    public function __construct(UserRepository $userRepository, UserPasswordEncoderInterface $encoder, GuardAuthenticatorHandler $guardHandler, IdeasRepository $ideasRepository)
    {
        $this->userRepository = $userRepository;
        $this->encoder = $encoder;
        $this->guardHandler = $guardHandler;
        $this->ideasRepository =  $ideasRepository;
    }

    /**
     * @Route("/main", name="main")
     * @param Request $request
     * @return Response
     */
    public function index(Request $request) : Response
    {
        if (strpos($request->getPathInfo(), '/idea/')){
            $number = 0;
            preg_match_all("/\d+/", $request->getPathInfo(), $number);

            $idea = $this->ideasRepository->find($number[0][0]);

            if (empty($idea)) {
                return $this->render('main.html.twig', ['meta' => '', 'image' => '', 'host' => $request->getHttpHost()]);
            } else {
                return $this->render('main.html.twig', [
                    'meta' => $idea,
                    'image' => ($idea->getPhoto())[0] && strpos(explode(";", $idea->getPhoto())[0], "http") ? explode(";", $idea->getPhoto())[0] :  "https://".$request->getHost().explode(";", $idea->getPhoto())[0],
                    'host' => $request->getHost(),
                ]);
            }
        }

        return $this->render('main.html.twig', ['meta' => '', 'image' => '', 'host' => $request->getHttpHost()]);
    }

    public function setLocale(Request $request) : Response
    {
        if (!$request->getLocale()) {
            $request->setLocale('ru');
        }

        return $this->redirect('/' . $request->getLocale() . '/');

    }

    /**
     * @Route("/api/web/upload/")
     * @param Request $request
     * @return Response
     */
    public function upload(Request $request): Response
    {
        return $this->json(AppController::saveFile($request, $this->getParameter('kernel.project_dir') . '/public/' . $this->getParameter('app.name') . '/', $this->getDoctrine()->getManager()));
    }

    /**
     * @Route("/api/web/decode/user/")
     * @param Request $request
     * @return Response
     */
    public function decodeUserInfo(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if ($data) {
            $userBase64 = $data['user'];
        } else {
            $userBase64 = $request->get('user');
        }
        if (empty($userBase64)) {
            return $this->json(['state' => 'error', 'message' => "Передайте закодированные данные пользователя"]);
        }
        $user = AppController::decodeBase64User($userBase64);
        $email = $user[0];
        $password = $user[1];
        return $this->json([
            "state" => "success",
            "user" => array(
                "username" => $email,
                "password" => $password
            )
        ]);
    }
}
