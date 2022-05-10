<?php

namespace App\Controller;

use App\Entity\Categories;
use App\Entity\Comments;
use App\Entity\Ideas;
use App\Entity\Types;
use App\Entity\User;
use App\Entity\Votes;
use App\Repository\CategoriesRepository;
use App\Repository\CommentsRepository;
use App\Repository\IdeasRepository;
use App\Repository\StatusRepository;
use App\Repository\TypesRepository;
use App\Repository\UserRepository;
use App\Repository\VotesRepository;
use DateTime;
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
    private $categoriesRepository;
    private $typesRepository;
    private $ideasRepository;
    private $userRepository;
    private $statusRepository;
    private $votesRepository;
    private $commentsRepository;
    private $encoder;

    /**
     * @param CategoriesRepository $categoriesRepository
     * @param TypesRepository $typesRepository
     * @param IdeasRepository $ideasRepository
     * @param UserRepository $userRepository
     * @param StatusRepository $statusRepository
     * @param VotesRepository $votesRepository
     * @param CommentsRepository $commentsRepository
     * @param UserPasswordEncoderInterface $encoder
     */
    public function __construct(CategoriesRepository $categoriesRepository, TypesRepository $typesRepository, IdeasRepository $ideasRepository,
                                UserRepository $userRepository, StatusRepository $statusRepository, VotesRepository $votesRepository,
                                CommentsRepository $commentsRepository, UserPasswordEncoderInterface $encoder)
    {
        $this->categoriesRepository = $categoriesRepository;
        $this->typesRepository = $typesRepository;
        $this->ideasRepository = $ideasRepository;
        $this->userRepository = $userRepository;
        $this->statusRepository = $statusRepository;
        $this->votesRepository = $votesRepository;
        $this->commentsRepository = $commentsRepository;
        $this->encoder = $encoder;
    }

    /**
     * @Route("/ideas/api/new/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     * @throws Exception
     */
    public function new_idea(Request $request, MailerInterface $mailer): Response
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            if (empty($user)) {
                throw new Exception("unauthorized");
            }
            $data = json_decode($request->getContent(), true);
            if ($data) {
                $title = $data['title'];
                $desc = $data['description'];
                $catid = $data['category'];
                $typeid = $data['type'];
                $photo = $data['photo'];
            } else {
                $title = $request->get('title');
                $desc = $request->get('description');
                $catid = $request->get('category');
                $typeid = $request->get('type');
                $photo = $request->get('photo');
            }
            if (empty($photo)) {
                $photo = null;
            }
            $this->checkParamsError($title, $desc, $catid, $typeid);
            $category = $this->getCategoryOrCreate($catid);
            $type = $this->getTypeOrCreate($typeid);
            $status = $this->statusRepository->findOneBy(['name' => 'new']);

            $idea = new Ideas();
            $idea->setTitle($title)
                ->setContent($desc)
                ->setUser($user)
                ->setDate(new DateTime())
                ->setCategory($category)
                ->setType($type)
                ->setStatus($status)
                ->setPhoto($photo);
            $this->ideasRepository->save($idea);

            // TODO: После добавления идеи отправить ссылку на почту диме
//            $urlIdea = $this->generateUrl("idea_show") . $idea->getId() . "/";
//            $message = "Добавлена новая идея: $title\n\nСсылка: $urlIdea";
//            AppController::sendEmail($mailer, $message);

            return $this->json([
                "state" => "success",
            ]);
        } catch (Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        } catch (TransportExceptionInterface $e) {
            file_put_contents($this->getParameter('kernel.project_dir') . '/log/mail_error_log.txt', date('d-m-Y H:i:s') . ' ' . $e->getMessage() . "\n", FILE_APPEND);
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/ideas/api/add_idea/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     * @throws Exception
     */
    public function add_idea(Request $request, MailerInterface $mailer): Response
    {
        try {
            $data = json_decode($request->getContent(), true);
            if ($data) {
                $title = $data['title'];
                $desc = $data['description'];
                $catid = $data['category'];
                $typeid = $data['type'];
                $href = $data['href'];
                $email = $data['email'];
                $pass = $data['pass'];
                $name = $data['name'];
            } else {
                $title = $request->get('title');
                $desc = $request->get('description');
                $catid = $request->get('category');
                $typeid = $request->get('type');
                $href = $request->get('href');
                $email = $request->get('email');
                $pass = $request->get('pass');
                $name = $request->get('name');
            }
            if (empty($href)) {
                $href = null;
            }
            $this->checkParamsError($title, $desc, $catid, $typeid);
            $category = $this->getCategoryOrCreate($catid);
            $type = $this->getTypeOrCreate($typeid);
            $user = $this->getUserOrCreate($email, $pass, $name);
            $photo = $this->saveFile($request);
            $status = $this->statusRepository->findOneBy(['name' => 'new']);

            $idea = new Ideas();
            $idea->setTitle($title)
                ->setContent($desc)
                ->setUser($user)
                ->setDate(new DateTime())
                ->setCategory($category)
                ->setType($type)
                ->setStatus($status)
                ->setPhoto($photo)
                ->setHref($href);
            $this->ideasRepository->save($idea);

            $userBase64 = AppController::encodeBase64User($user->getEmail(), $user->getOpenPassword());
            $urlIdea = $this->generateUrl("idea_show") . $idea->getId() . "/";
            $redirectURL = $this->generateUrl("auto_redirect", array(
                'url' => $urlIdea,
                'user' => $userBase64
            ));

            // TODO: После добавления идеи отправить ссылку на почту диме
//            $message = "Добавлена новая идея: $title\n\nСсылка: $urlIdea";
//            AppController::sendEmail($mailer, $message);

            return $this->json([
                "state" => "success",
                "url" => $redirectURL
            ]);
        } catch (TransportExceptionInterface $e) {
            file_put_contents($this->getParameter('kernel.project_dir') . '/log/mail_error_log.txt', date('d-m-Y H:i:s') . ' ' . $e->getMessage() . "\n", FILE_APPEND);
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        } catch (Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }
    /**
     * @param $title
     * @param $desc
     * @param $catid
     * @param $typeid
     * @throws Exception
     */
    private function checkParamsError($title, $desc, $catid, $typeid){
        if(empty($title) or empty($desc) or empty($catid) or empty($typeid)){
            throw new Exception("Введите значения title, description, category, type.");
        }
        if($catid < 1){
            throw new Exception("Неверно выбрана категория");
        }
        if($typeid < 1){
            throw new Exception("Неверно выбран тип");
        }
        if(strlen($title) < 5){
            throw new Exception("Заголовок не может быть меньше 5 символов");
        }
        if(strlen($desc) < 10){
            throw new Exception("Описание не может быть меньше 10 символов");
        }
    }

    /**
     * @Route("/ideas/api/getIdeas/{category_id}/")
     * @param Request $request
     * @return Response
     */
    public function getIdeas(Request $request): Response
    {
//        return dd($_GET);
        $categories = array($request->get("category_id"));
        $order = !empty($_GET["order"]) ? $_GET["order"] : 'date';
        $type = !empty($_GET["type"]) ? $_GET["type"] : 'desc';
        $page = (int)!empty($_GET["page"]) ? $_GET["page"] : 1;

        $limit = 10;
        $from = ($page - 1) * 10;

        $data['types'] = $this->typesRepository->findAll();
        $data['status'] = $this->statusRepository->findAll();
        // Фильтры по типам
        if(empty($_GET["types"])){
            $types = array();
            foreach ($data['types'] as $typeOne) {
                $types[] = $typeOne->getId();
            }
        } else {
            $typesGET = json_decode($_GET["types"]);
            $types = array();
            foreach ($data['types'] as $t) {
                if(in_array($t->getId(), $typesGET)){
                    $types[] = $t->getId();
                }
            }
        }
        // Фильтры по статусам
        if(empty($_GET["status"])){
            $statuses = array();
            foreach ($data['status'] as $status) {
                if($status->getName() != "new"){
                    $statuses[] = $status->getId();
                }
            }
        } else {
            $statusGET = json_decode($_GET["status"]);
            $statuses = array();
            foreach ($data['status'] as $status) {
                if(in_array($status->getId(), $statusGET)){
                    $statuses[] = $status->getId();
                }
            }
        }
        try {
            $category = $this->categoriesRepository->find($categories[0]);
            if(empty($category)){
                throw new \Exception("Такой категории не существует");
            }
            if(empty($types)){
                throw new \Exception("Укажите существующие типы для поиска");
            }

            if($order == "votes"){
//                dd($type);
                $ideas = $this->ideasRepository->getIdeas("id", $type == 'desc'? 1 : 0, $from, $limit, $statuses, $categories, $types);
                $ideas = $this->decorateIdeas($ideas);
//                dd(count($ideas));
                $ideas = $this->array_sort($ideas,"likes",$type == 'desc'? SORT_DESC : SORT_ASC);
            } else {
                $ideas = $this->ideasRepository->getIdeas($order, $type == 'desc'? 1 : 0, $from, $limit, $statuses, $categories, $types);
                $ideas = $this->decorateIdeas($ideas);
//                dd($ideas);
            }

            return $this->json(['state' => 'success', 'ideas' => $ideas]); // $this->decorateIdeas($ideas)
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/ideas/api/getCategories/")
     * @param Request $request
     * @return Response
     */
    public function getCategories(Request $request): Response
    {
        try {
            $Categories = $this->categoriesRepository->findAll();
            $Types = $this->typesRepository->findAll();
            $Status = $this->statusRepository->findAll();

            return $this->json([
                'state' => 'success',
                'categories' => $Categories,
                "types" => $Types,
                'statuses' => $Status,
            ]);
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/ideas/api/newComment/")
     * @param Request $request
     * @return Response
     */
    public function newComment(Request $request): Response
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            if (empty($user)) {
                throw new Exception("unauthorized");
            }
            $data = json_decode($request->getContent(), true);
            if (!empty($data)) {
                $idea_id = $data['idea_id'];
                $content = $data['content'];

            } else {
                $idea_id = $request->get('idea_id');
                $content = $request->get('content');
            }
            if(empty($content)){
                throw new Exception("Сообщение не должно быть пустым");
            }
            if (!empty($idea_id)) {
                $idea = $this->ideasRepository->find($idea_id);
                if (empty($idea)) {
                    throw new Exception("Такой идеи не существует");
                }
            } else {
                throw new Exception("Передайте idea_id");
            }

            $newComment = new Comments();
            $newComment->setDate(new DateTime())
                ->setIdea($idea)
                ->setUser($user)
                ->setContent($content);
            $this->commentsRepository->save($newComment);

            return $this->json(['state' => 'success']);
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }
    /**
     * @Route("/api/delete/comment/")
     * @param Request $request
     * @return Response
     */
    public function deleteComment(Request $request): Response
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            if (empty($user)) {
                throw new Exception("unauthorized");
            }
            $data = json_decode($request->getContent(), true);
            if (!empty($data)) {
                $comment_id = $data['comment_id'];
            } else {
                $comment_id = $request->get('comment_id');
            }
            if(empty($comment_id)){
                throw new Exception("Передайте comment_id");
            }
            $comment = $this->commentsRepository->find($comment_id);
            if(empty($comment)){
                throw new Exception("Такого комментария не существует");
            }
            // Удалять если админ или автор комментария
            if(in_array("ROLE_ADMIN", $user->getRoles())
              or $user->getId() == $comment->get_User()->getId()){
                $this->commentsRepository->remove($comment);
                return $this->json(['state' => 'success']);
            } else {
                throw new Exception("Вы не можете удалить этот комментарий");
            }
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/ideas/api/newVote/")
     * @param Request $request
     * @return Response
     */
    public function newVote(Request $request): Response
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            if (empty($user)) {
                throw new Exception("unauthorized");
            }
            $data = json_decode($request->getContent(), true);
            if (!empty($data)) {
                $idea_id = $data['idea_id'];
                $type = $data["type"];
            } else {
                $idea_id = $request->get('idea_id');
                $type = $request->get('type');
            }
            if(!empty($type)){
                if($type != "like" and $type != "dislike"){
                    throw new Exception("Голос может быть только like или dislike");
                }
            } else {
                throw new Exception("Передайте тип голоса");
            }
            if (!empty($idea_id)) {
                $idea = $this->ideasRepository->find($idea_id);
                if (empty($idea)) {
                    throw new Exception("Такой идеи не существует");
                }
            } else {
                throw new Exception("Передайте idea_id");
            }
            $ideaStatusName = $idea->get_Status()->getName();
            if($ideaStatusName == 'completed' or $ideaStatusName == 'declined'){
                throw new Exception("За эту идею нельзя проголосовать");
            }
            // Проверка проголосовал ли он уже за эту идею
            $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
            foreach ($votes as $vote){
                if($vote->get_User()->getId() == $user->getId()){
                    if($vote->getType() == $type){
                        throw new Exception("Вы уже поставили $type этой идее");
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
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }
    /**
     * @Route("/api/delete/vote/")
     * @param Request $request
     * @return Response
     */
    public function unVote(Request $request): Response
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            if (empty($user)) {
                throw new Exception("unauthorized");
            }
            $data = json_decode($request->getContent(), true);
            if (!empty($data)) {
                $idea_id = $data['idea_id'];
            } else {
                $idea_id = $request->get('idea_id');
            }
            if (!empty($idea_id)) {
                $idea = $this->ideasRepository->find($idea_id);
                if (empty($idea)) {
                    throw new Exception("Такой идеи не существует");
                }
            } else {
                throw new Exception("Передайте idea_id");
            }
            $ideaStatusName = $idea->get_Status()->getName();
            if($ideaStatusName == 'completed' or $ideaStatusName == 'declined'){
                throw new Exception("Нельзя убрать голос с этой идеи");
            }
            // Проверка проголосовал ли он уже за эту идею
            $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
            foreach ($votes as $vote){
                if($vote->get_User()->getId() == $user->getId()){
                    $this->votesRepository->remove($vote);
                    return $this->json(['state' => 'success']);
                }
            }

            throw new Exception("Вы не голосовали за эту идею");
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/ideas/api/setStatus/")
     * @param Request $request
     * @return Response
     * @throws Exception
     */
    public function setStatus(Request $request): Response
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            if (empty($user)) {
                throw new Exception("unauthorized");
            }
            $data = json_decode($request->getContent(), true);
            if (!empty($data)) {
                $idea_id = $data['idea_id'];
                $status_id = $data['status_id'];
            } else {
                $idea_id = $request->get('idea_id');
                $status_id = $request->get('status_id');
            }
            if (!empty($idea_id)) {
                $idea = $this->ideasRepository->find($idea_id);
                if (empty($idea)) {
                    throw new Exception("Такой идеи не существует");
                }
            } else {
                throw new Exception("Передайте idea_id");
            }
//            dd($idea);
            $newStatus = $this->statusRepository->find($status_id);
            if (empty($newStatus)) {
                throw new Exception("Такого статуса не существует");
            }
            if(in_array("ROLE_ADMIN", $user->getRoles())
                or in_array("ROLE_DEVELOPER", $user->getRoles()))
            {
                $idea->setStatus($newStatus);
                $this->ideasRepository->save($idea);

                if ($idea->get_Status()->getName() == "new") {
                    if ($newStatus->getName() == $idea->get_Status()->getName()) {
                        throw new Exception("Нельзя поменять статус на такой же как и прежде");
                    }
                    if ($idea->get_Type()->getName() == "Сообщить о проблеме") {
                        $response = AppController::curl("https://gitlab.atma.company/api/v4/projects/96/issues", "POST", array(
                            "title" => $idea->getTitle(),
                            "description" => $idea->getContent()
                        ));
//                        dd($response);
                    }
                }
                return $this->json(['state' => 'success']);
            } else {
                throw new Exception("Вы не можете изменить статус этой идеи");
            }
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }
    /**
     * @Route("/api/closeIssue")
     * @param Request $request
     * @return Response
     * @throws Exception
     */
    public function closeIssue(Request $request): Response
    {
        try {
            $data = json_decode($request->getContent(), true);
            if(empty($data)) {
                throw new Exception("Данные не получены");
            }
//            dd($data);
            if ($data["object_attributes"]["closed_at"] != null) {
                $idea = $this->ideasRepository->findOneBy(["title" => $data["object_attributes"]["title"]]);
                if (!empty($idea)) {
                    $newStatus = $this->statusRepository->findOneBy(["name" => "completed"]);
                    $idea->setStatus($newStatus);
                    $this->ideasRepository->save($idea);
                } else {
                    throw new Exception("Такой идеи не существует");
                }
            }
            return $this->json(['state' => 'success']);
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
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
                $category = new Categories("Прочее", "Все записи, которые не определили к конкретной категории");
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
                $type = new Types("Без классификации", "Все записи, которые не определили к конкретному типу");
                $this->typesRepository->save($type);
            }
        }
        return $type;
    }
    /**
     * @param $email
     * @param $pass
     * @param $name
     * @return User
     * @throws Exception
     */
    private function getUserOrCreate($email, $pass, $name){
        if(empty($email)){
            throw new Exception("Нет email чтобы найти/зарегистрировать пользователя");
        }
        /** @var $user User */
        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (empty($user)) {
            if (empty($pass)) {
                throw new Exception("Нет пароля чтобы зарегистрировать нового пользователя");
            }
            if(empty($name)){
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
    private function saveFile($request){
        $project_dir = $this->getParameter('kernel.project_dir') . '/public/' . $this->getParameter('app.name') . '/';
        $upload = AppController::saveFile($request, $project_dir, $this->getDoctrine()->getManager());
        if (!empty($upload["filename"])) {
            return $upload["filename"];
        } else {
            return null;
        }
    }
    // array_sort($array, 'key', SORT_DESC);
    private function array_sort($array, $on, $order=SORT_ASC)
    {
        $new_array = array();
        $sortable_array = array();

        if (!empty($array)) {
            foreach ($array as $k => $v) {
                if (is_array($v)) {
                    foreach ($v as $k2 => $v2) {
                        if ($k2 == $on) {
                            $sortable_array[$k] = $v2;
                        }
                    }
                } else {
                    $sortable_array[$k] = $v;
                }
            }

            switch ($order) {
                case SORT_ASC:
                    asort($sortable_array);
                    break;
                case SORT_DESC:
                    arsort($sortable_array);
                    break;
            }

            foreach ($sortable_array as $k => $v) {
                $new_array[$k] = $array[$k];
            }
        }

        return array_values((array)$new_array);
    }
    private function decorateIdeas($ideas): ?array
    {
        if(empty($ideas)){
            return null;
        }
        /** @var User $user */
        $user = $this->getUser();
        for($i = 0; $i < count($ideas); $i++){
            /** @var $idea Ideas */
            $idea = $ideas[$i];
            $ideas[$i] = $idea->get_Info();
            $ideas[$i]["comments"] = $idea->get_CommentsArray();

            if(empty($user)){
                $ideas[$i]["currentUserIsVote"] = "unauthorized";
                continue;
            }
            $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
            if(empty($votes)){
                $ideas[$i]["currentUserIsVote"] = false;
                continue;
            }
            foreach ($votes as $vote){
                if($vote->get_User()->getId() == $user->getId()){
                    $ideas[$i]["currentUserIsVote"]= true;
                    break;
                } else {
                    $ideas[$i]["currentUserIsVote"]= false;
                }
            }
        }
        return $ideas;
    }
}
