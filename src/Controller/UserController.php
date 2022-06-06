<?php

namespace App\Controller;

use App\Entity\Ideas;
use App\Repository\SettingsRepository;
use App\Repository\UserRepository;
use App\Repository\VotesRepository;
use DateInterval;
use DateTime;
use Doctrine\Common\Collections\Collection;
use Exception;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Validator\Constraints\Date;
use function Symfony\Component\DomCrawler\last;

class UserController extends AbstractController
{
    private UserRepository $userRepository;
    private SettingsRepository $settingsRepository;
    private VotesRepository $votesRepository;
    private UserPasswordEncoderInterface $encoder;

    public function __construct(UserRepository $userRepository, SettingsRepository $settingsRepository,
                                VotesRepository $votesRepository, UserPasswordEncoderInterface $encoder)
    {
        $this->userRepository = $userRepository;
        $this->settingsRepository = $settingsRepository;
        $this->votesRepository = $votesRepository;
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
            if ($this->sendToMail($mailer, $message, "Вход в Atmaguru Feedback", $user->getEmail())) {
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
            if ($this->sendToMail($mailer, $message, "Вход в Atmaguru Feedback", $user->getEmail())) {
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
     * @Route("/api/ag/user/setProfile/")
     * @param Request $request
     * @return Response
     */
    public function setProfile(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['email']) or empty($data['first_name'])) {
            return $this->json(['state' => 'error', 'message' => "Передайте email, first_name"]);
        }

        /** @var User $user */
        $user = $this->userRepository->findOneBy(["email" => $data['email']]);
        if (empty($user)) {
            return $this->json(['state' => 'error', 'message' => "Такого пользователя не существует"]);
        }

        $user->setEmail($data['email'])
            ->setUsername($data['email'])
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
        if (!empty($data['system_id'])) {
            $user->setSystemId($data['system_id']);
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
//        $data = json_decode($request->getContent(), true);
        $data = $request->get("page");
        if (empty($data)) {
            return $this->json(['state' => 'error', 'message' => "Передайте параметр page"]);
        }
        $response = array(
            'state' => 'success',
            'profile' => $user->get_Profile(),
        );
        switch ($data) {
            case 1:
                $ideas = $user->get_Ideas();
                $ideas = $this->decorateCollectionIdeas($ideas);
                $response["ideas"] = $ideas;
                break;
            case 2:
                $comments = $user->get_CommentsArray();
                $response["comments"] = $comments;
                break;
            case 3:
                $likes = $user->get_VotesArray();
                foreach ($likes as &$like) {
                    $decorIdea = $this->decorateArrayIdeas(array($like['idea']));

                    $like['idea'] = $decorIdea[0] ?: null;
                }
                $response["likes"] = $likes;
                break;
            default:
                return $this->json(['state' => 'trouble', 'profile' => $user->get_Profile(), 'message' => "Такой страницы профиля нет"]);
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
        for ($i = 0; $i < $ideas->count(); $i++) {
            /** @var $idea Ideas */
            $idea = $ideas[$i];
            $ideasArr[$i] = $idea->get_Info();
            $ideasArr[$i]["comments"] = $idea->get_CommentsArray();

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

    private function sendToMail(MailerInterface $mailer, string $message, string $subject, string $toMail): bool
    {
        // Берем почты из бд
        $from_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-main"]);
        $bcc_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-bcc"]);
        try {
            if (!empty($toMail) and !empty($from_mail) and !empty($bcc_mail)) {
                AppController::sendEmail($mailer, $message, $subject, $toMail, $from_mail->getValue(), $bcc_mail->getValue());
                return true;
            } else {
                return false;
            }
        } catch (TransportExceptionInterface $e) {
            return false;
        }
    }
}
