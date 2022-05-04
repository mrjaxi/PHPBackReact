<?php

namespace App\Controller;

use App\Entity\Categories;
use App\Entity\Ideas;
use App\Entity\Types;
use App\Entity\User;
use App\Repository\CategoriesRepository;
use App\Repository\IdeasRepository;
use App\Repository\TypesRepository;
use App\Repository\UserRepository;
use DateTime;
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
    private $encoder;

    /**
     * @param CategoriesRepository $categoriesRepository
     * @param TypesRepository $typesRepository
     * @param IdeasRepository $ideasRepository
     * @param UserRepository $userRepository
     * @param UserPasswordEncoderInterface $encoder
     */
    public function __construct(CategoriesRepository $categoriesRepository, TypesRepository $typesRepository, IdeasRepository $ideasRepository,
                                UserRepository $userRepository, UserPasswordEncoderInterface $encoder)
    {
        $this->categoriesRepository = $categoriesRepository;
        $this->typesRepository = $typesRepository;
        $this->ideasRepository = $ideasRepository;
        $this->userRepository = $userRepository;
        $this->encoder = $encoder;
    }

    /**
     * @Route("/ideas/api/new/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function new_idea(Request $request, MailerInterface $mailer): Response
    {
        $baseUrl = $request->getBaseUrl();
        $user = $this->getUser();
        if (empty($user)) {
            return $this->json(array(
                'state' => 'unauthorized'
            ));
        }
        $data = json_decode($request->getContent(), true);
//        return dd($data); // $request->get("title")
        if ($data) {
            $title = $data['title'];
            $desc = $data['description'];
            $catid = $data['category'];
            $typeid = $data['type'];
        } else {
            $title = $request->get('title');
            $desc = $request->get('description');
            $catid = $request->get('category');
            $typeid = $request->get('type');
        }
        $files = $_FILES['file'];

        if(empty($files['name'][0])){
            $files = null;
        }
        if(empty($title) or empty($desc) or empty($catid) or empty($typeid)){
            return $this->json(["state" => "error", "message" => "Не введены значения title, description, category, type, email"]);
        }
        if($catid < 1){
            return $this->json(["state" => "error", "message" => "Неверно выбрана категория"]);
        }
        if($typeid < 1){
            return $this->json(["state" => "error", "message" => "Неверно выбран тип"]);
        }
        if(strlen($title) < 5){
            return $this->json(["state" => "error", "message" => "Заголовок не может быть меньше 5 символов"]);
        }
        if(strlen($desc) < 10){
            return $this->json(["state" => "error", "message" => "Описание не может быть меньше 10 символов"]);
        }
        if(empty($this->categoriesRepository->find($catid))){
            $category = $this->categoriesRepository->findOneBy(['name' => "Прочее"]);
            if(empty($category)){
                $category = new Categories("Прочее", "Все записи, которые не определили к конкретной категории");
                $this->categoriesRepository->save($category);
            }
            $catid = $category->getId();
        }
        if(empty($this->typesRepository->find($typeid))){
            $type = $this->typesRepository->findOneBy(['name' => "Без классификации"]);
            if(empty($type)){
                $type = new Types("Без классификации", "Все записи, которые не определили к конкретному типу");
                $this->typesRepository->save($type);
            }
            $typeid = $type->getId();
        }

        try {
            $photo = AppController::add_file($files);

            $idea = new Ideas();
            $idea->setTitle($title)
                ->setContent($desc)
                ->setAuthorId($user->getId())
                ->setDate(new DateTime())
                ->setCategoryId($catid)
                ->setTypeId($typeid)
                ->setStatus('new')
                ->setPhoto($photo);
            $this->ideasRepository->save($idea);

            // TODO: После добавления идеи отправить ссылку на почту диме
//            $url = $baseUrl . 'home/idea/' . $idea->getId();
//            $message = "Добавлена новая идея: $title\n\nСсылка: $url";
//            AppController::sendEmail($mailer, $message);

            return $this->json([
                "state" => "success",
            ]);
        } catch (\Exception $e){
            return $this->json(['state' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/ideas/api/add_idea/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function add_idea(Request $request, MailerInterface $mailer): Response
    {
        $baseUrl = $request->getBaseUrl();
        $title = $_POST['title'];
        $desc = $_POST['description'];
        $catid = $_POST['category'];
        $typeid = $_POST['type'];
        $href = $_POST['href'];
        $email = $_POST['email'];
        $pass = $_POST['pass'];
        $name = $_POST['name'];
        $files = $_FILES['file'];
        if(empty($name)){
            $name = "Незнакомец";
        }
        if(empty($href)){
            $href = null;
        }
        if(empty($files['name'][0])){
            $files = null;
        }
//        return $this->json(['state' => 'file', 'file' => $files]);

        if(empty($title) or empty($desc) or empty($catid) or empty($typeid) or empty($email)){
            return $this->json(["state" => "error", "message" => "Не введены значения title, description, category, type, email"]);
        }
        if($catid < 1){
            return $this->json(["state" => "error", "message" => "Неверно выбрана категория"]);
        }
        if($typeid < 1){
            return $this->json(["state" => "error", "message" => "Неверно выбран тип"]);
        }
        if(strlen($title) < 5){
            return $this->json(["state" => "error", "message" => "Заголовок не может быть меньше 5 символов"]);
        }
        if(strlen($desc) < 10){
            return $this->json(["state" => "error", "message" => "Описание не может быть меньше 10 символов"]);
        }
        if(empty($this->categoriesRepository->find($catid))){
            $category = $this->categoriesRepository->findOneBy(['name' => "Прочее"]);
            if(empty($category)){
                $category = new Categories("Прочее", "Все записи, которые не определили к конкретной категории");
                $this->categoriesRepository->save($category);
            }
            $catid = $category->getId();
        }
        if(empty($this->typesRepository->find($typeid))){
            $type = $this->typesRepository->findOneBy(['name' => "Без классификации"]);
            if(empty($type)){
                $type = new Types("Без классификации", "Все записи, которые не определили к конкретному типу");
                $this->typesRepository->save($type);
            }
            $typeid = $type->getId();
        }

        try {
            $user = $this->userRepository->findOneBy(['email' => $email]);
            if (empty($user)) {
                if (empty($pass)) {
                    return $this->json(["state" => "error", "message" => "Нет пароля чтобы зарегистрировать нового пользователя"]);
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
            $photo = AppController::add_file($files);

            $idea = new Ideas();
            $idea->setTitle($title)
                ->setContent($desc)
                ->setAuthorId($user->getId())
                ->setDate(new DateTime())
                ->setCategoryId($catid)
                ->setTypeId($typeid)
                ->setStatus('new')
                ->setPhoto($photo)
                ->setHref($href);
            $this->ideasRepository->save($idea);

            $userBase64 = AppController::encodeBase64User($user->getEmail(), $user->getOpenPassword());
            $url = $baseUrl . 'home/idea/' . $idea->getId();
            $redirectURL = $this->generateUrl("auto_redirect",array(
                'url'  => $url,
                'user' => $userBase64
            ));

            // TODO: После добавления идеи отправить ссылку на почту диме
//            $message = "Добавлена новая идея: $title\n\nСсылка: $url";
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

        if(empty($_GET)){
//            dd("БАЗА ЗАПРОС");
            $cat = array($categoryid);
            $status = array("completed", "started", "planned", "considered", "declined");
            $types = array();
            foreach ($data['types'] as $t) {
                $types[] = $t->getId();
            }

        } else{
//            dd($_GET["types"]);
            $cat = array($categoryid);
            $typesGET = json_decode($_GET["types"]);
            $statusGET = json_decode($_GET["status"]);
            $status = array();
            if(in_array('completed', $statusGET)) $status[] = "completed";
            if(in_array('started', $statusGET)) $status[] = "started";
            if(in_array('planned', $statusGET)) $status[] = "planned";
            if(in_array('considered', $statusGET)) $status[] = "considered";
            if(in_array('declined', $statusGET)) $status[] = "declined";
            if(in_array('new', $statusGET)) $status[] = "new";

            $types = array();
            foreach ($data['types'] as $t) {
                if(in_array($t->getId(), $typesGET)){
                    $types[] = $t->getId();
                }
            }
        }
        try {
            $ideas = $this->ideasRepository->getIdeas($order, $type == 'desc'? 1 : 0, $from, $limit, $status, $cat, $types);

            return $this->json(['state' => 'success', 'ideas' => $ideas]);
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
            return $this->json([
                'state' => 'success',
                'categories' => $this->categoriesRepository->findAll(),
                "types" => $this->typesRepository->findAll()
            ]);
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
        $idea = $this->ideasRepository->find($request->get("id"));
        if(empty($idea)){
            return $this->json(['state' => 'error', 'message' => "Такой идеи не существует"]);
        }
        $newStatus = $request->get("status");

        /** TODO: Если это тип "Сообщить о проблеме" то кинуть его в issues в Atmaguru
         *  Это нужно сделать именно при подтверждении идеи, а как оно будет происходить пока не понятно
         */
        $type = $this->typesRepository->find($idea->getTypeId());
        if ($type->getName() == "Сообщить о проблеме") {
            AppController::curl("https://gitlab.atma.company/api/v4/projects/96/issues", "POST", array(
                "title" => $idea->getTitle(),
                "description" => $idea->getContent()
            ));
        }

        return $this->json(['state' => 'success']);
    }
}
