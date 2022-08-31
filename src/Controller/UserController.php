<?php

namespace App\Controller;

use App\Entity\Ideas;
use App\Repository\IdeasRepository;
use App\Repository\SettingsRepository;
use App\Repository\UserRepository;
use App\Repository\VotesRepository;
use DateTime;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityNotFoundException;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
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
    private SettingsRepository $settingsRepository;
    private VotesRepository $votesRepository;
    private IdeasRepository $ideasRepository;
    private UserPasswordEncoderInterface $encoder;

    public function __construct(UserRepository $userRepository, SettingsRepository $settingsRepository,
                                VotesRepository $votesRepository, IdeasRepository $ideasRepository,
                                UserPasswordEncoderInterface $encoder)
    {
        $this->userRepository = $userRepository;
        $this->settingsRepository = $settingsRepository;
        $this->votesRepository = $votesRepository;
        $this->ideasRepository = $ideasRepository;
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
        $data = json_decode($request->getContent(), true);
        if (empty($data['username'])) {
            return $this->json(['state' => 'error', 'message' => "Передайте почту"]);
        }
        $user = $this->userRepository->findOneBy(["email" => $data['username']]);
        if (empty($user)) {
            $user = $this->userRepository->findOneBy(["username" => $data['username']]);
            if (empty($user)) {
                return $this->json(['state' => 'error', 'message' => "Такого пользователя не существует"]);
            }
        }
        $expires = AppController::getExpires();
        $userInfo = AppController::encodeBase64User($user->getEmail(), $user->getOpenPassword());
        $baseURL = $request->getScheme() . '://' . $request->getHttpHost();
        $url = $baseURL . $this->generateUrl("api_redirect", array(
                "user" => $userInfo,
                "expires" => $expires,
            ));
        $message = "Попытка входа в ваш аккаунт Atmaguru Feedback. Чтобы войти в аккаунт, перейдите по ссылке:\n\n{$url}";
//        dd($url);

        /** @var DateTime $last_auth */
        $last_auth = $user->getLastAuth();
        $currentDateTime = new DateTime();
        if (empty($last_auth)) {
            $user->setLastAuth($currentDateTime );
            $this->userRepository->save($user);
            if ($this->sendToMail($mailer, $message, "Вход в Atmaguru Feedback", $user->getEmail(), true)) {
                return $this->json(['state' => 'success', "seconds" => 120,]);
            } else {
                return $this->json([
                    'state' => 'trouble',
                    "seconds" => 120,
                    "message" => "Не удалось отправить сообщение на почту",
                ]);
            }
        }
        $last_auth->modify("+2 minute");
        if ($last_auth < $currentDateTime) {
            $user->setLastAuth($currentDateTime);
            $this->userRepository->save($user);
            if ($this->sendToMail($mailer, $message, "Вход в Atmaguru Feedback", $user->getEmail(), true)) {
                return $this->json(['state' => 'success', "seconds" => 120,]);
            } else {
                return $this->json([
                    'state' => 'trouble',
                    "seconds" => 120,
                    "message" => "Не удалось отправить сообщение на почту",
                ]);
            }
        } else {
            $diff = $last_auth->diff($currentDateTime);
            $diffMin = (int)$diff->format('%i');
            $diffSec = (int)$diff->format('%s');
            $allSec = $diffMin * 60 + $diffSec;
            return $this->json([
                "state" => "timer",
                "seconds" => $allSec,
                "message" => "Подождите " . AppController::num_word($allSec,["секунду", "секунды", 'секунд']) . " перед следующей попыткой входа",
            ]);
        }
    }

    /**
     * @Route("/api/web/redirect/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function redirectToReact(Request $request, MailerInterface $mailer): Response
    {
        $userInfo = $request->get("user");
        $expires = (int)$request->get("expires");
        if (!$request->getLocale()) {
            $request->setLocale('ru');
        }
        if (empty($userInfo) or empty($expires)) {
            return $this->redirect('/' . $request->getLocale() . '/');
        }
        if (!AppController::checkExpires($expires)) {
            return $this->redirect('/' . $request->getLocale() . '/');
        }
        $baseURL = "{$request->getScheme()}://{$request->getHttpHost()}/{$request->getLocale()}/";
        $redirectURL = $baseURL . "redirect?" .
            "url=/{$request->getLocale()}/" .
            "&user={$userInfo}";
//        dd($redirectURL);
        return $this->redirect($redirectURL);
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
            return $this->json(['state' => 'error', 'message' => "Передайте email и Имя. Опционально Фамилию, Отчество, Номер телефона и Адрес фотографии "]);
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
        if (!empty($data['phone'])) {
            $user->setPhone($data['phone']);
        }
        if (!empty($data['image'])) {
            $user->setImage($data['image']);
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
     * @Route("/api/ag/getUserByEmail/")
     * @param Request $request
     * @return Response
     */
    public function getUserByEmail(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if ($data['email']) {
            /** @var User $user */
            $user = $this->userRepository->findOneBy(["email" => $data['email']]);
            if (empty($user)) {
                return $this->json(['state' => 'error', 'message' => "Такого пользователя не существует"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "Передвайте email"]);
        }
//        dd($user);
        return $this->json(['state' => 'success', 'user' => $user->get_Profile()]);
    }

    /**
     * @Route("/api/admin/ideas/setRole/")
     * @param Request $request
     * @return Response
     */
    public function setRole(Request $request): Response
    {
        /** @var User $currentUser */
        $currentUser = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if(empty($data['user_id']) || empty($data['new_role'])){
            return $this->json(['state' => 'error', 'message' => "Передайте user_id и new_role"]);
        }
        $user = $this->userRepository->find($data['user_id']);
        if(empty($user)){
            return $this->json(['state' => 'error', 'message' => "Такого пользователя не существует"]);
        }
        if($currentUser->getId() === $user->getId()){
            return $this->json(['state' => 'error', 'message' => "Вы не можете изменить свою роль"]);
        }
        $user->setRoles([$data['new_role']]);
        $this->userRepository->save($user);

        return $this->json(['state' => 'success', 'profile' => $user->get_Profile()]);
    }

    /**
     * @Route("/api/user/setProfile/")
     * @param Request $request
     * @return Response
     */
    public function setProfile(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (empty($data['first_name'])) {
            return $this->json(['state' => 'error', 'message' => "Передайте first_name"]);
        }

        $user->setFirstName($data['first_name']);
        if (!empty($data['middle_name'])) {
            $user->setMiddleName($data['middle_name']);
        } else {
            $user->setMiddleName(null);
        }

        if (!empty($data['last_name'])) {
            $user->setLastName($data['last_name']);
        } else {
            $user->setLastName(null);
        }

        if (!empty($data['image'])) {
            $user->setImage($data['image']);
        } else {
            $user->setImage(null);
        }

        if (!empty($data['phone'])) {
            $user->setPhone($data['phone']);
        } else {
            $user->setPhone(null);
        }
        $this->userRepository->save($user);

        return $this->json(['state' => 'success', 'profile' => $user->get_Profile()]);
    }

    /**
     * @Route("/api/user/unsubscribe/")
     * @param Request $request
     * @return JsonResponse
     */
    public function mailUnsubscribe(Request $request) : Response
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!empty($user) && !empty($data["type"])) {
            $type = $data["type"];
            $userItem = $this->userRepository->findOneBy(["id" => $user->getId()]);

            if ($type == "unsubscribe") {
                $userItem->setUnsubscribe(true);
                $this->userRepository->save($userItem);

                return $this->json(['state' => 'success', 'message' => $type]);
            } else if ($type == "subscribe") {
                $userItem->setUnsubscribe(false);
                $this->userRepository->save($userItem);

                return $this->json(['state' => 'success', 'message' => $type]);
            }

            return $this->json(['state' => 'error', 'message' => 'Ошибка отписки от рассылки']);
        } else {
            return $this->json(['state' => 'error', 'message' => 'Вы не зарегистрированы']);
        }
    }

    /**
     * @Route("/api/web/user/{id}/")
     * @param Request $request
     * @param $id
     * @return Response
     */
    public function getUserProfile(Request $request, $id): Response
    {
        /** @var User $User */
        $User = $this->getUser();
        /* @var User $user */
        $user = $this->userRepository->find($id);
        if (empty($user)) {
            return $this->json(['state' => 'error', 'message' => "Такого пользователя нет"]);
        }
        $userIdeas = $user->get_Ideas();
        $page = (int)$request->get("page");
        $response = array(
            'state' => 'success',
            'profile' => $user->get_Profile(),
            'count' => array(
                'ideas' => 0,
                'comments' => count($user->get_CommentsArray()),
                'likes' => count($user->get_VotesArray()),
            )
        );
        // Если неавторизованный или не админ или не его профиль
        if (empty($User) or !in_array("ROLE_ADMIN", $User->getRoles()) and $user->getId() !== $User->getId())
        {
            $userIdeas = $userIdeas->filter(function ($idea) {
                // Если не рассмотренные то удаляются
                return !($idea->get_Status()->getName() === "new");
            });
        }
        $response["count"]["ideas"] = $userIdeas->count();
        switch ($page) {
            case 1:
                $ideas = $this->decorateCollectionIdeas($userIdeas);
                $ideas = AppController::array_sort($ideas, "id", SORT_DESC);
                $response["ideas"] = $ideas;
                break;
            case 2:
                $ideas = [];
                $ideasIds = []; // in_array("ROLE_ADMIN", $user->getRoles())
                $comments = $user->get_CommentsArray(true);

                foreach ($comments as &$comment) {
                    /** @var Ideas $commentIdea */
                    $commentIdea = $comment["idea"];
                    $ideasIds[] = $commentIdea->getId();
                }
                $ideasIds = array_values(array_unique($ideasIds));
                foreach ($ideasIds as &$idea_id) {
                    $idea = $this->ideasRepository->find($idea_id);
                    try {
                        $decorIdea = $this->decorateArrayIdeas(array($idea))[0];
                    } catch (EntityNotFoundException $exception) {
                        continue;
                    }
                    foreach ($decorIdea["comments"] as $key => $comment) {
                        if($comment["user"]["id"] !== $user->getId()){
                            unset($decorIdea["comments"][$key]);
                        }
                    }
                    $decorIdea["comments"] = array_values($decorIdea["comments"]);
                    $ideas[] = $decorIdea;
                }
                $ideas = AppController::array_sort($ideas, "id", SORT_DESC);
                $response["ideas"] = $ideas;
                break;
            case 3:
                $likes = $user->get_VotesArray(true);

                foreach ($likes as $index => &$like) {
                    try {
                        if (!empty($like['idea']->getTitle())) {
                            $decorIdea = $this->decorateArrayIdeas(array($like['idea']));
                            $like['idea'] = $decorIdea[0] ?: null;
                        }
                    } catch (EntityNotFoundException $exception) {
                        unset($likes[$index]);
                    }
                }

                $likes = AppController::array_sort($likes, "id", SORT_DESC);
                $response["likes"] = $likes;
                break;
            default:
                $response["message"] = "Такой страницы профиля нет";
                return $this->json($response);
                break;
        }

        return $this->json($response);
    }

    private function decorateCollectionIdeas(Collection $ideas): ?array
    {
        if ($ideas->isEmpty()) {
            return null;
        }
        /** @var User $user */
        $user = $this->getUser();
        $ideasArr = array();
        foreach ($ideas as $i => &$idea) {
            /** @var $idea Ideas */
            $ideasArr[$i] = $idea->get_Info();
            $ideasArr[$i]["comments"] = $idea->get_CommentsArray();

            $ideasArr[$i]["notification"] = false;
            if(!empty($user)){
                foreach ($ideasArr[$i]["comments"] as &$comment){
                    if(!$comment["is_checked"]){
                        $ideasArr[$i]["notification"] = true;
                        break;
                    }
                }
            }

            if (empty($user)) {
                $ideasArr[$i]["currentUserIsVote"] = "unauthorized";
                continue;
            }
            $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
            if (empty($votes)) {
                $ideasArr[$i]["currentUserIsVote"] = false;
                continue;
            }
            foreach ($votes as $vote) {
                if ($vote->get_User()->getId() == $user->getId()) {
                    $ideasArr[$i]["currentUserIsVote"] = true;
                    break;
                } else {
                    $ideasArr[$i]["currentUserIsVote"] = false;
                }
            }
        }
        return $ideasArr;
    }

    private function decorateArrayIdeas(?array $ideas): ?array
    {
        if (empty($ideas)) {
            return null;
        }
        /** @var User $user */
        $user = $this->getUser();
        for ($i = 0; $i < count($ideas); $i++) {
            /** @var $idea Ideas */
            $idea = $ideas[$i];
            $ideas[$i] = $idea->get_Info();
            $ideas[$i]["comments"] = $idea->get_CommentsArray();

            $ideas[$i]["notification"] = false;
            if(!empty($user)){
                foreach ($ideas[$i]["comments"] as &$comment){
                    if(!$comment["is_checked"] && !empty($user) && $idea->get_User()->getId() === $user->getId()){
                        $ideas[$i]["notification"] = true;
                        break;
                    }
                }
            }

            if (empty($user)) {
                $ideas[$i]["currentUserIsVote"] = "unauthorized";
                continue;
            }
            $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
            if (empty($votes)) {
                $ideas[$i]["currentUserIsVote"] = false;
                continue;
            }
            foreach ($votes as $vote) {
                if ($vote->get_User()->getId() == $user->getId()) {
                    $ideas[$i]["currentUserIsVote"] = true;
                    break;
                } else {
                    $ideas[$i]["currentUserIsVote"] = false;
                }
            }
        }
        return $ideas;
    }

    private function sendToMail(MailerInterface $mailer, string $message, string $subject, string $toMail, $loginMail = false): bool
    {
        // Берем почты из бд
        $bcc_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-bcc"]);
        try {
            if (!empty($toMail) and !empty($bcc_mail)) {
                AppController::sendEmail($mailer, $message, $subject, $toMail, $bcc_mail->getValue(), $loginMail);
                return true;
            } else {
                return false;
            }
        } catch (TransportExceptionInterface $e) {
            return false;
        }
    }
}
