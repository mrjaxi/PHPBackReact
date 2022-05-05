<?php

namespace App\Controller;

use App\Entity\Categories;
use App\Entity\Ideas;
use App\Entity\Types;
use App\Entity\User;
use App\Repository\CategoriesRepository;
use App\Repository\IdeasRepository;
use App\Repository\StatusRepository;
use App\Repository\TypesRepository;
use App\Repository\UserRepository;
use DateTime;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class IdeasController extends AbstractController
{
    private $categoriesRepository;
    private $typesRepository;
    private $ideasRepository;
    private $userRepository;
    private $statusRepository;
    private $encoder;

    /**
     * @param CategoriesRepository $categoriesRepository
     * @param TypesRepository $typesRepository
     * @param IdeasRepository $ideasRepository
     * @param UserRepository $userRepository
     * @param StatusRepository $statusRepository
     * @param UserPasswordEncoderInterface $encoder
     */
    public function __construct(CategoriesRepository $categoriesRepository, TypesRepository $typesRepository, IdeasRepository $ideasRepository,
                                UserRepository $userRepository, StatusRepository $statusRepository, UserPasswordEncoderInterface $encoder)
    {
        $this->categoriesRepository = $categoriesRepository;
        $this->typesRepository = $typesRepository;
        $this->ideasRepository = $ideasRepository;
        $this->userRepository = $userRepository;
        $this->statusRepository = $statusRepository;
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
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        } catch (TransportExceptionInterface $e) {
            file_put_contents($this->getParameter('kernel.project_dir') . '/log/mail_error_log.txt', date('d-m-Y H:i:s') . ' ' . $e->getMessage() . "\n", FILE_APPEND);
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
        $categoryid = $request->get("category_id");
        $order = !empty($_GET["order"]) ? $_GET["order"] : 'date';
        $type = !empty($_GET["type"]) ? $_GET["type"] : 'desc';
        $page = (int)!empty($_GET["page"]) ? $_GET["page"] : 1;

        $limit = 10;
        $from = ($page - 1) * 10;

        $data['categories'] = $this->categoriesRepository->findAll();
        $data['types'] = $this->typesRepository->findAll();
        $data['status'] = $this->statusRepository->findAll();
//        return dd($data['types']);

        if(empty($_GET)){
//            dd("БАЗА ЗАПРОС");
            $categories = array($categoryid);
            $types = array();
            foreach ($data['types'] as $type) {
                $types[] = $type->getId();
            }
            $statuses = array();
            foreach ($data['status'] as $status) {
                if($status->getName() != "new"){
                    $statuses[] = $status->getId();
                }
            }

        } else{
//            return dd($_GET);
            $categories = array($categoryid);
            $typesGET = json_decode($_GET["types"]);
            $statusGET = json_decode($_GET["status"]);
            $statuses = array();
            foreach ($data['status'] as $status) {
                if(in_array($status->getId(), $statusGET)){
                    $statuses[] = $status->getId();
                }
            }

            $types = array();
            foreach ($data['types'] as $t) {
                if(in_array($t->getId(), $typesGET)){
                    $types[] = $t->getId();
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

            $ideas = $this->ideasRepository->getIdeas($order, $type == 'desc'? 1 : 0, $from, $limit, $statuses, $categories, $types);
            return $this->json(['state' => 'success', 'ideas' => $this->decorateIdeas($ideas)]); // $this->decorateIdeas($ideas)
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

            $categories = array();
            $types = array();
            foreach($Categories as $category){
                $categories[] = $category->getInfo();
            }
            foreach($Types as $type){
                $types[] = $type->getInfo();
            }

            return $this->json([
                'state' => 'success',
                'categories' => $categories,
                "types" => $types,
                'statuses' => $Status,
            ]);
        } catch (\RuntimeException $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    // TODO: Апи добавления комментария
    /**
     * @Route("/ideas/api/newComment/{id}/")
     * @param Request $request
     * @return Response
     */
    public function newComment(Request $request): Response
    {
        try {
            return $this->json(['state' => 'error', 'message' => "newComment"]);
        } catch (\RuntimeException $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    // TODO: Апи добавления голоса
    /**
     * @Route("/ideas/api/newVote/{id}/")
     * @param Request $request
     * @return Response
     */
    public function newVote(Request $request): Response
    {
        try {
            return $this->json(['state' => 'error', 'message' => "newVote"]);
        } catch (\RuntimeException $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    // TODO: Апи изменения статуса идеи по id
    /**
     * @Route("/ideas/api/setStatus/{id}/")
     * @param Request $request
     * @return Response
     */
    public function setStatus(Request $request): Response
    {
//        $idea = $this->ideasRepository->find($request->get("id"));
//        if(empty($idea)){
//            return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
//        }
//        $data = json_decode($request->getContent(), true);
//        if ($data) {
//            $newStatus = $data['status_id'];
//        } else {
//            $newStatus = $request->get('status_id');
//        }
//
//
//        /** TODO: Если это тип "Сообщить о проблеме" то кинуть его в issues в Atmaguru
//         *  Это нужно сделать именно при подтверждении идеи, а как оно будет происходить пока не понятно
//         */
//        $type = $idea->getType();
//        if ($type->getName() == "Сообщить о проблеме") {
//            AppController::curl("https://gitlab.atma.company/api/v4/projects/96/issues", "POST", array(
//                "title" => $idea->getTitle(),
//                "description" => $idea->getContent()
//            ));
//        }
//
//        return $this->json(['state' => 'success']);
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
    private function decorateIdeas($ideas){
        if(empty($ideas)){
            return null;
        }
        for($i = 0; $i < count($ideas); $i++){
            /** @var $idea Ideas */
            $idea = $ideas[$i];
            $ideas[$i] = $idea->getInfo();
            $ideas[$i]["comments"] = $idea->getCommentsArray();
//            $ideas[$i] = $idea->getId();
        }
        return $ideas;
    }
}
