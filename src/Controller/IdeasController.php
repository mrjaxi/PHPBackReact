<?php

namespace App\Controller;

use ApiPlatform\Core\DataProvider\Pagination;
use App\Entity\Categories;
use App\Entity\Comments;
use App\Entity\Ideas;
use App\Entity\Settings;
use App\Entity\Types;
use App\Entity\User;
use App\Entity\Votes;
use App\Repository\CategoriesRepository;
use App\Repository\CommentsRepository;
use App\Repository\IdeasRepository;
use App\Repository\SettingsRepository;
use App\Repository\StatusRepository;
use App\Repository\TypesRepository;
use App\Repository\UserRepository;
use App\Repository\VotesRepository;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Validator\Constraints\Date;

class IdeasController extends AbstractController
{
    private CategoriesRepository $categoriesRepository;
    private TypesRepository $typesRepository;
    private IdeasRepository $ideasRepository;
    private UserRepository $userRepository;
    private StatusRepository $statusRepository;
    private VotesRepository $votesRepository;
    private CommentsRepository $commentsRepository;
    private SettingsRepository $settingsRepository;
    private UserPasswordEncoderInterface $encoder;

    /**
     * @param CategoriesRepository $categoriesRepository
     * @param TypesRepository $typesRepository
     * @param IdeasRepository $ideasRepository
     * @param UserRepository $userRepository
     * @param StatusRepository $statusRepository
     * @param VotesRepository $votesRepository
     * @param CommentsRepository $commentsRepository
     * @param SettingsRepository $settingsRepository
     * @param UserPasswordEncoderInterface $encoder
     */
    public function __construct(CategoriesRepository $categoriesRepository, TypesRepository $typesRepository, IdeasRepository $ideasRepository,
                                UserRepository $userRepository, StatusRepository $statusRepository, VotesRepository $votesRepository,
                                CommentsRepository $commentsRepository, SettingsRepository $settingsRepository,
                                UserPasswordEncoderInterface $encoder)
    {
        $this->categoriesRepository = $categoriesRepository;
        $this->typesRepository = $typesRepository;
        $this->ideasRepository = $ideasRepository;
        $this->userRepository = $userRepository;
        $this->statusRepository = $statusRepository;
        $this->votesRepository = $votesRepository;
        $this->commentsRepository = $commentsRepository;
        $this->settingsRepository = $settingsRepository;
        $this->encoder = $encoder;
    }

    /**
     * @Route("/api/user/ideas/new/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     * @throws Exception
     */
    public function new_idea(Request $request, MailerInterface $mailer): Response
    {
        $baseURL = $request->getScheme() . '://' . $request->getHttpHost();
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (empty($data)) {
            return $this->json(['state' => 'error', 'message' => "Передайте данные"]);
        }
        if (empty($data['photo'])) {
            $data['photo'] = null;
        }
        try {
            $this->checkParamsError($data['title'], $data['description'], $data['category'], $data['type']);
        } catch (Exception $e) {
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
        $category = $this->getCategoryOrCreate($data['category']);
        $type = $this->getTypeOrCreate($data['type']);
        $status = $this->statusRepository->findOneBy(['name' => 'new']);

        $idea = new Ideas();
        $idea->setTitle($data['title'])
            ->setContent($data['description'])
            ->setUser($user)
            ->setCategory($category)
            ->setType($type)
            ->setStatus($status)
            ->setPhoto($data['photo']);
        $this->ideasRepository->save($idea);

        $urlIdea = $baseURL . "/idea/" . $idea->getId();
        $message = "Добавлена новая идея: {$data['title']}\n\nСсылка: {$urlIdea}";
        if ($this->sendMailToAdmin($mailer, $message, "Новый отзыв")) {
            return $this->json([
                "state" => "success",
                "idea_id" => $idea->getId()
            ]);
        } else {
            return $this->json([
                'state' => 'trouble',
                "idea_id" => $idea->getId(),
                'message' => "Не удалось отправить почту"
            ]);
        }
    }

    /**
     * @Route("/api/ag/ideas/add_idea/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     * @throws Exception
     */
    public function add_idea(Request $request, MailerInterface $mailer): Response
    {
        if (!$request->getLocale()) {
            $request->setLocale('ru');
        }
        $baseURL = "{$request->getScheme()}://{$request->getHttpHost()}/{$request->getLocale()}";

        $data = json_decode($request->getContent(), true);
        if (empty($data)) {
            return $this->json(['state' => 'error', 'message' => "Передайте данные"]);
        }
        if (empty($data['href'])) {
            $data['href'] = null;
        }
        try {
            $this->checkParamsError($data['title'], $data['description'], $data['category'], $data['type']);
            $user = $this->getUserOrCreate($data['email'], $data['pass'], $name = $data['name']);
        } catch (Exception $e) {
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
        $category = $this->getCategoryOrCreate($data['category']);
        $type = $this->getTypeOrCreate($data['type']);
        $photo = $data['photo'] ?: null;
        $status = $this->statusRepository->findOneBy(['name' => 'new']);

        $idea = new Ideas();
        $idea->setTitle($data['title'])
            ->setContent($data['description'])
            ->setUser($user)
            ->setCategory($category)
            ->setType($type)
            ->setStatus($status)
            ->setPhoto($photo)
            ->setHref($data['href']);
        $this->ideasRepository->save($idea);

        $userBase64 = AppController::encodeBase64User($user->getEmail(), $user->getOpenPassword());
        $urlIdea = "/idea/" . $idea->getId();
        $redirectURL = $baseURL . $this->generateUrl("auto_redirect", array(
                'url' => $urlIdea,
                'user' => $userBase64
            ));

        $message = "Добавлена новая идея: {$data['title']}\n\nСсылка: {$baseURL}{$urlIdea}";
        if ($this->sendMailToAdmin($mailer, $message, "Новый отзыв")) {
            return $this->json([
                "state" => "success",
                "url" => $redirectURL
            ]);
        } else {
            return $this->json([
                'state' => 'trouble',
                "url" => $redirectURL,
                'message' => "Не удалось отправить почту"
            ]);
        }
    }

    /**
     * @param $title
     * @param $desc
     * @param $catid
     * @param $typeid
     * @throws Exception
     */
    private function checkParamsError($title, $desc, $catid, $typeid)
    {
        if (empty($title) or empty($desc) or empty($catid) or empty($typeid)) {
            throw new Exception("Введите значения title, description, category, type.");
        }
        if ($catid < 1) {
            throw new Exception("Неверно выбрана категория");
        }
        if ($typeid < 1) {
            throw new Exception("Неверно выбран тип");
        }
        if (strlen($title) < 5) {
            throw new Exception("Заголовок не может быть меньше 5 символов");
        }
        if (strlen($desc) < 10) {
            throw new Exception("Описание не может быть меньше 10 символов");
        }
    }

    /**
     * @Route("/api/web/ideas/getIdeas/")
     * @param Request $request
     * @return Response
     */
    public function getIdeas(Request $request): Response
    {
        $order = !empty($request->get("order")) ? $request->get("order") : 'date';
        $type = !empty($request->get("type")) ? $request->get("type") : 'desc';
        $page = (int)!empty($request->get("page")) ? $request->get("page") : 1;

        $limit = 10;
        $from = ($page - 1) * 10;

        $data['categories'] = $this->categoriesRepository->findAll();
        $data['types'] = $this->typesRepository->findAll();
        $data['status'] = $this->statusRepository->findAll();
        // Фильтры по категориям
        $categories = array();
        if (empty($request->get("categories"))) {
            foreach ($data['categories'] as $category) {
                $categories[] = $category->getId();
            }
        } else {
            $categoriesGET = json_decode($request->get("categories"));
            if (empty($categoriesGET) or count($categoriesGET) < 1 or gettype($categoriesGET[0]) != "integer") {
                foreach ($data['categories'] as $category) {
                    $categories[] = $category->getId();
                }
            } else {
                foreach ($data['categories'] as $category) {
                    if (in_array($category->getId(), $categoriesGET)) {
                        $categories[] = $category->getId();
                    }
                }
            }
        }
        // Фильтры по типам
        $types = array();
        if (empty($request->get("types"))) {
            foreach ($data['types'] as $typeOne) {
                $types[] = $typeOne->getId();
            }
        } else {
            $categoriesGET = json_decode($request->get("types"));
            if (empty($categoriesGET) or count($categoriesGET) < 1 or gettype($categoriesGET[0]) != "integer") {
                foreach ($data['types'] as $typeOne) {
                    $types[] = $typeOne->getId();
                }
            } else {
                foreach ($data['types'] as $t) {
                    if (in_array($t->getId(), $categoriesGET)) {
                        $types[] = $t->getId();
                    }
                }
            }
        }
        // Фильтры по статусам
        $statuses = array();
        if (empty($request->get("status"))) {
            foreach ($data['status'] as $status) {
                if ($status->getName() != "new") {
                    $statuses[] = $status->getId();
                }
            }
        } else {
            $statusGET = json_decode($request->get("status"));
            if (empty($statusGET) or gettype($statusGET[0]) != "integer") {
                foreach ($data['status'] as $status) {
                    if ($status->getName() != "new") {
                        $statuses[] = $status->getId();
                    }
                }
            } else {
                foreach ($data['status'] as $status) {
                    if (in_array($status->getId(), $statusGET)) {
                        $statuses[] = $status->getId();
                    }
                }
            }
        }
        if (empty($categories)) {
            return $this->json(['state' => 'error', 'message' => "Такой категории не существует"]);
        }
        if (empty($types)) {
            return $this->json(['state' => 'error', 'message' => "Укажите существующие типы для поиска"]);
        }
        if (empty($statuses)) {
            return $this->json(['state' => 'error', 'message' => "Укажите существующие статусы для поиска"]);
        }
//        dd($statuses);

        if ($order == "votes") {
//            dd($type);
            $ideas = $this->ideasRepository->getIdeas("id", $type == 'desc' ? 1 : 0, $from, $limit, $statuses, $categories, $types);
            $ideas = $this->decorateIdeas($ideas);
//            dd(count($ideas));
            $ideas = AppController::array_sort($ideas, "likes", $type == 'desc' ? SORT_DESC : SORT_ASC);
        } else {
            $ideas = $this->ideasRepository->getIdeas($order, $type == 'desc' ? 1 : 0, $from, $limit, $statuses, $categories, $types);
            $ideas = $this->decorateIdeas($ideas);
//            dd($ideas);
        }

        return $this->json(['state' => 'success', 'ideas' => $ideas]); // $this->decorateIdeas($ideas)
    }

    /**
     * @Route("/api/web/idea/{idea_id}/")
     * @param Request $request
     * @param $idea_id
     * @return Response
     */
    public function getIdea(Request $request, $idea_id): Response
    {
        $idea = $this->ideasRepository->find($idea_id);

        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
        }
        $ideaInfo = $this->decorateIdeas(array($idea));

        return $this->json(['state' => 'success', 'idea' => $ideaInfo]);
    }

    /**
     * @Route("/api/web/ideas/search/")
     * @param Request $request
     * @return Response
     */
    public function search(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $searchTitle = $data['title'];
            $searchContent = $data['content'];
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте title и/или content"]);
        }
        if (empty($searchTitle) and empty($searchContent)) {
            return $this->json(['state' => 'error', 'message' => "Передайте title или content"]);
        }
        if (!empty($searchTitle) and !empty($searchContent)) {
            $ideas = $this->ideasRepository->searchIdeas($searchTitle, $searchContent);
        } else {
            if (!empty($searchTitle)) {
                $ideas = $this->ideasRepository->searchIdeas($searchTitle, "");
            } else if (!empty($searchContent)) {
                $ideas = $this->ideasRepository->searchIdeas("", $searchContent);
            }
        }
        $ideas = $this->decorateIdeas($ideas);
        if (!empty($ideas)) {
            foreach ($ideas as &$idea) {
                $idea["commentsCount"] = count($idea['comments']);
                unset($idea['comments']);
            }
        }

        return $this->json(['state' => 'success', 'ideas' => $ideas]);
    }

    /**
     * @Route("/api/web/ideas/getCategories/")
     * @param Request $request
     * @return Response
     */
    public function getCategories(Request $request): Response
    {
        $Categories = $this->categoriesRepository->findAll();
        $Types = $this->typesRepository->findAll();
        $Statuses = $this->statusRepository->findAll();

        /** @var User $user */
        $user = $this->getUser();
        if (!empty($user)) {
            if (!in_array("ROLE_ADMIN", $user->getRoles())
                and !in_array("ROLE_DEVELOPER", $user->getRoles())) {
                foreach ($Statuses as $key => $status) {
                    if ($status->getName() == "new") {
                        unset($Statuses[$key]);
                    }
                }
            }
        } else {
            foreach ($Statuses as $key => $status) {
                if ($status->getName() == "new") {
                    unset($Statuses[$key]);
                }
            }
        }

        return $this->json([
            'state' => 'success',
            'categories' => $Categories,
            "types" => $Types,
            'statuses' => $Statuses,
        ]);
    }

    /**
     * @Route("/api/user/ideas/newComment/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function newComment(Request $request, MailerInterface $mailer): Response
    {
        $baseURL = $request->getScheme() . '://' . $request->getHttpHost();
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data['idea_id']) && !empty($data['content'])) {
            $idea_id = $data['idea_id'];
            $content = $data['content'];
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте idea_id и content"]);
        }
        if (empty($content)) {
            return $this->json(['state' => 'error', 'message' => "Сообщение не должно быть пустым"]);
        }
        if (!empty($idea_id)) {
            $idea = $this->ideasRepository->find($idea_id);
            if (empty($idea)) {
                return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте idea_id"]);
        }
        if (!$idea->getAllowComments()) {
            return $this->json(['state' => 'error', 'message' => "Под этой идеей нельзя оставлять комментарии"]);
        }
        /** @var Comments $lastComment
         */
        $lastComment = $idea->get_Comments()->last();

        $newComment = new Comments();
        $newComment->setIdea($idea)
            ->setUser($user)
            ->setContent($content);
        $this->commentsRepository->save($newComment);

        if($user->getId() !== $idea->get_User()->getId()){
//            if($lastComment->getDate())
            $urlIdea = $baseURL . "/idea/" . $idea->getId();
            $message = "К вашей записи оставили комментарий: {$newComment->getContent()}\n\nСсылка: {$urlIdea}";
            $this->sendToMail($mailer, $message, "Новый комментарий", $idea->get_User()->getEmail());
        }

        return $this->json(['state' => 'success', 'comment' => $newComment->get_Info()]);
    }

    /**
     * @Route("/api/user/ideas/changeComment/")
     * @param Request $request
     * @return Response
     */
    public function changeComment(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $comment_id = $data['comment_id'];
            $content = $data['content'];
            if(empty($comment_id) || empty($content)){
                return $this->json(['state' => 'error', 'message' => "Передайте comment_id и content"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте comment_id и content"]);
        }
        $comment = $this->commentsRepository->find($comment_id);
        if (empty($comment)) {
            return $this->json(['state' => 'error', 'message' => "Такого комментария не существует"]);
        }
        // Изменить если автор комментария
        if ($user->getId() == $comment->get_User()->getId()) {
            $comment->setContent($content);
            $this->commentsRepository->save($comment);
            return $this->json(['state' => 'success', 'comment' => $comment->get_Info()]);
        } else {
            return $this->json(['state' => 'error', 'message' => "Вы не можете изменить этот комментарий"]);
        }
    }

    /**
     * @Route("/api/user/delete/comment/")
     * @param Request $request
     * @return Response
     */
    public function deleteComment(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $comment_id = $data['comment_id'];
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте comment_id"]);
        }
        $comment = $this->commentsRepository->find($comment_id);
        if (empty($comment)) {
            return $this->json(['state' => 'error', 'message' => "Такого комментария не существует"]);
        }
        // Удалять если админ или автор комментария
        if (in_array("ROLE_ADMIN", $user->getRoles())
            or $user->getId() == $comment->get_User()->getId()) {
            $this->commentsRepository->remove($comment);
            return $this->json(['state' => 'success', 'comment' => $comment->get_Info()]);
        } else {
            return $this->json(['state' => 'error', 'message' => "Вы не можете удалить этот комментарий"]);
        }
    }

    /**
     * @Route("/api/admin/ideas/setOfficialComment/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function setOfficialComment(Request $request, MailerInterface $mailer): Response
    {
        $baseURL = $request->getScheme() . '://' . $request->getHttpHost();
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data['idea_id']) && !empty($data['content']) && !empty($data['close'])) {
            $idea_id = $data['idea_id'];
            $content = $data['content'];
            $closed = (bool)$data['close'];
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте idea_id, content и close"]);
        }
        $idea = $this->ideasRepository->find($idea_id);
        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
        }

        $newComment = new Comments();
        $newComment->setIdea($idea)
            ->setUser($user)
            ->setContent($content);
        $this->commentsRepository->save($newComment);

        $idea->setAllowComments(false)
            ->setOfficialComment($newComment);

        if($user->getId() !== $idea->get_User()->getId()){
            $urlIdea = $baseURL . "/idea/" . $idea->getId();
            $message = "К вашей записи оставили Официальный ответ: {$newComment->getContent()}\n\nСсылка: {$urlIdea}";
            $this->sendToMail($mailer, $message, "Официальный ответ", $idea->get_User()->getEmail());
        }

        return $this->json(['state' => 'success', 'comment' => $newComment->get_Info()]);
    }

    /**
     * @Route("/api/user/ideas/newVote/")
     * @param Request $request
     * @return Response
     */
    public function newVote(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $idea_id = $data['idea_id'];
            $type = $data["type"];
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте idea_id и type"]);
        }
        if (!empty($type)) {
            if ($type != "like" and $type != "dislike") {
                return $this->json(['state' => 'error', 'message' => "Голос может быть только like или dislike"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "Укажите тип голоса"]);
        }
        if (!empty($idea_id)) {
            $idea = $this->ideasRepository->find($idea_id);
            if (empty($idea)) {
                return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте номер идеи"]);
        }
        if (!$idea->getAllowComments()) {
            return $this->json(['state' => 'error', 'message' => "За эту идею нельзя проголосовать"]);
        }
        // Проверка проголосовал ли он уже за эту идею
        $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
        foreach ($votes as $vote) {
            if ($vote->get_User()->getId() == $user->getId()) {
                if ($vote->getType() == $type) {
                    return $this->json(['state' => 'error', 'message' => "Вы уже поставили $type этой идее"]);
                } else {
                    $vote->setType($type);
                    $this->votesRepository->save($vote);
                    return $this->json(['state' => 'success']);
                }
            }
        }

        $newVote = new Votes();
        $newVote->setDate(new DateTime())
            ->setIdea($idea)
            ->setUser($user)
            ->setType($type);
        $this->votesRepository->save($newVote);

        return $this->json(['state' => 'success']);
    }

    /**
     * @Route("/api/user/delete/vote/")
     * @param Request $request
     * @return Response
     */
    public function unVote(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $idea_id = $data['idea_id'];
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте idea_id"]);
        }
        if (!empty($idea_id)) {
            $idea = $this->ideasRepository->find($idea_id);
            if (empty($idea)) {
                return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте idea_id"]);
        }
        if (!$idea->getAllowComments()) {
            return $this->json(['state' => 'error', 'message' => "Нельзя убрать голос с этой идеи"]);
        }
        // Проверка проголосовал ли он уже за эту идею
        $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
        foreach ($votes as $vote) {
            if ($vote->get_User()->getId() == $user->getId()) {
                $this->votesRepository->remove($vote);
                return $this->json(['state' => 'success']);
            }
        }

        return $this->json(['state' => 'error', 'message' => "Вы не голосовали за эту идею"]);
    }

    /**
     * @Route("/api/admin/ideas/setStatus/")
     * @param Request $request
     * @return Response
     * @throws Exception
     */
    public function setStatus(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $idea_id = $data['idea_id'];
            $status_id = $data['status_id'];
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте idea_id и status_id"]);
        }
        // проверка и поиск идеи
        if (!empty($idea_id)) {
            $idea = $this->ideasRepository->find($idea_id);
            if (empty($idea)) {
                return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте ID идеи"]);
        }
        // проверка и поиск статуса
        if (!empty($status_id)) {
            $newStatus = $this->statusRepository->find($status_id);
            if (empty($newStatus)) {
                return $this->json(['state' => 'error', 'message' => "Такого статуса не существует"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "Передайте ID статуса"]);
        }
        if (in_array("ROLE_ADMIN", $user->getRoles())
            or in_array("ROLE_DEVELOPER", $user->getRoles())) {
            if ($newStatus->getName() == 'completed'
                or $newStatus->getName() == 'declined') {
                $idea->setAllowComments(false);
            } else {
                $idea->setAllowComments(true);
            }
            if ($newStatus->getName() == $idea->get_Status()->getName()) {
                return $this->json(['state' => 'error', 'message' => "Нельзя поменять статус на такой же как и прежде"]);
            }
            if ($idea->get_Status()->getName() == "new") {
                if ($idea->get_Type()->getName() == "Сообщить о проблеме") {
                    $response = AppController::curl("https://gitlab.atma.company/api/v4/projects/96/issues", "POST", array(
                        "title" => "Feedback. " . $idea->getTitle(),
                        "description" => $idea->getContent()
                    ));
//                        dd($response);
                }
            }
            $idea->setStatus($newStatus);
            $this->ideasRepository->save($idea);
            return $this->json(['state' => 'success']);
        } else {
            return $this->json(['state' => 'error', 'message' => "Вы не можете изменить статус этой идеи"]);
        }
    }

    /**
     * @Route("/api/ag/closeIssue")
     * @param Request $request
     * @return Response
     * @throws Exception
     */
    public function closeIssue(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data)) {
            return $this->json(['state' => 'error', 'message' => "Данные не получены"]);
        }
//        dd($data);
        if ($data["object_attributes"]["closed_at"] != null) {
            $idea = $this->ideasRepository->findOneBy(["title" => "Feedback. " . $data["object_attributes"]["title"]]);
            if (!empty($idea)) {
                $newStatus = $this->statusRepository->findOneBy(["name" => "completed"]);
                $idea->setStatus($newStatus);
                $this->ideasRepository->save($idea);
            } else {
                return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
            }
        }
        return $this->json(['state' => 'success']);
    }
    /**
     * @Route("/api/addTipData/")
     * @param Request $request
     * @return Response
     */
    public function importPhpBackData(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data) || empty($data["pass"]) ) {
            return $this->json(['state' => 'error', 'message' => "Данные не получены"]);
        }
        if($data["pass"] !== "freelord"){
            return $this->json(['state' => 'error', 'message' => "Неверный пароль"]);
        }
        $users = $data["users"];
        $ideas = $data["ideas"];
        $comments = $data["comments"];
        $votes = $data["votes"];

        $usersArr = array();
        foreach ($users as &$user) {
            $User = $this->userRepository->findOneBy(["email" => $user["email"]]);
            if (empty($User)) {
                $User = $this->userRepository->findOneBy(["username" => $user["email"]]);
                if (empty($User)) {
                    $User = new User();
                    $password = AppController::randomPassword();
                    $role = $user["isadmin"] > 0 ? ["ROLE_ADMIN"] : ['ROLE_USER'];
                    $User->setUsername($user["email"])
                        ->setPassword($this->encoder->encodePassword($User, $password))
                        ->setOpenPassword($password)
                        ->setEmail($user["email"])
                        ->setFirstName($user["name"])
                        ->setRoles($role)
                        ->setIsActive(true);
                    $this->userRepository->save($User);
                }
            }
            $usersArr[$user["id"]] = $User;
        }
        $ideasArr = array();
        foreach ($ideas as &$idea) {
            $Idea = $this->ideasRepository->findOneBy(["title" => $idea["title"]]);
            if (empty($Idea)) {
                $status = $this->statusRepository->findOneBy(["name" => $idea["status"]]);
                if (empty($status)) {
                    $status = $this->statusRepository->findOneBy(["name" => "new"]);
                }
                $category = $this->getCategoryOrCreate(((int)$idea["categoryid"] - 1));
                $type = $this->getTypeOrCreate((int)$idea["typeid"]);
                $dateTimeArr = explode(" ", $idea['date']);
                $dateArr = explode("/", $dateTimeArr[0]);
                $timeArr = explode(":", $dateTimeArr[1]);
                if(!empty($idea['photo'])){
                    $idea['photo'] = substr_replace($idea['photo'] ,"", -1);
                }
                $Idea = new Ideas();
                $Idea->setTitle($idea['title'])
                    ->setContent(str_replace("\n", '', $idea['content']))
                    ->setUser($usersArr[$idea["authorid"]])
                    ->setCategory($category)
                    ->setType($type)
                    ->setStatus($status)
                    ->setPhoto($idea['photo'] ? "https://tip.atmaguru.online/" . $idea['photo'] : null)
                    ->setHref($idea['href'])
                    ->setDate((new DateTime())->setDate(2022, (int)$dateArr[1], (int)$dateArr[0])->setTime((int)$timeArr[0], (int)$timeArr[1]));
                if($status->getName() === "completed" || $status->getName() === "declined"){
                    $Idea->setAllowComments(false);
                }

                $this->ideasRepository->save($Idea);
            }
            $ideasArr[$idea["id"]] = $Idea;
        }
        $commentsArr = array();
        foreach ($comments as $comment) {
            $dateTimeArr = explode(" ", $comment['date']);
            $dateArr = explode("/", $dateTimeArr[0]);
            $timeArr = explode(":", $dateTimeArr[1]);
            $Comment = new Comments();
            $Comment->setContent($comment["content"])
                ->setDate((new DateTime())->setDate(2022, (int)$dateArr[1], (int)$dateArr[0])->setTime((int)$timeArr[0], (int)$timeArr[1]))
                ->setUser($usersArr[$comment["userid"]])
                ->setIdea($ideasArr[$comment["ideaid"]])
                ->setIsChecked(true);
            $this->commentsRepository->save($Comment);
//            dd($Comment);
            $commentsArr[$comment["id"]] = $Comment;
        }
        $votesArr = array();
        foreach ($votes as $vote) {
            $Vote = new Votes();
            $Vote->setDate(new DateTime())
                ->setUser($usersArr[$vote["userid"]])
                ->setIdea($ideasArr[$vote["ideaid"]])
                ->setType("like");
            $this->votesRepository->save($Vote);
            $votesArr[$vote["id"]] = $Vote;
//            dd($Vote);
        }
        return $this->json([ 'state' => 'success' ]);
    }

    /**
     * @param $category_id
     * @return Categories
     */
    private function getCategoryOrCreate($category_id): Categories
    {
        $category = $this->categoriesRepository->find($category_id);
        if (empty($category)) {
            $category = $this->categoriesRepository->findOneBy(['name' => "Прочее"]);
            if (empty($category)) {
                $category = new Categories();
                $category->setName("Прочее")
                    ->setDescription("Все записи, которые не определили к конкретной категории");
                $this->categoriesRepository->save($category);
            }
        }
        return $category;
    }

    /**
     * @param $type_id
     * @return Types
     */
    private function getTypeOrCreate($type_id): Types
    {
        $type = $this->typesRepository->find($type_id);
        if (empty($type)) {
            $type = $this->typesRepository->findOneBy(['name' => "Без классификации"]);
            if (empty($type)) {
                $type = new Types();
                $type->setName("Без классификации")
                    ->setDescription("Все записи, которые не определили к конкретному типу")
                    ->setColor("#2B2D33");
                $this->typesRepository->save($type);
            }
        }
        return $type;
    }

    /**
     * @param string $email
     * @param string $pass
     * @param string $name
     * @return User
     * @throws Exception
     */
    private function getUserOrCreate(string $email, string $pass, string $name)
    {
        if (empty($email)) {
            throw new Exception("Нет email чтобы найти/зарегистрировать пользователя");
        }
        /** @var $user User */
        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (empty($user)) {
            if (empty($pass)) {
                throw new Exception("Нет пароля чтобы зарегистрировать нового пользователя");
            }
            if (empty($name)) {
                $name = "Незнакомец";
            }
            $user = new User();
            $user->setUsername($email)
                ->setPassword($this->encoder->encodePassword($user, $pass))
                ->setOpenPassword($pass)
                ->setEmail($email)
                ->setFirstName($name)
                ->setRoles(['ROLE_USER'])
                ->setIsActive(true);
            $this->userRepository->save($user);
        }
        return $user;
    }

    private function sendMailToAdmin(MailerInterface $mailer, string $message, string $subject): bool
    {
        // Берем почты из бд
        $from_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-main"]);
        $admin_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-admin"]);
        $bcc_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-bcc"]);
        try {
            if (!empty($admin_mail) and !empty($from_mail) and !empty($bcc_mail)) {
                AppController::sendEmail($mailer, $message, $subject, $admin_mail->getValue(), $from_mail->getValue(), $bcc_mail->getValue());
                return true;
            } else {
                return false;
            }
        } catch (TransportExceptionInterface $e) {
            return false;
        }
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

    /**
     * @param array|null $ideas
     * @return array|null
     */
    private function decorateIdeas(?array $ideas): ?array
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
}
