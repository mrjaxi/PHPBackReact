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
use DateInterval;
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
use function Symfony\Component\DomCrawler\add;

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
            return $this->json(['state' => 'error', 'message' => "?????????????????? ????????????"]);
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
        $message = "?????????????????? ?????????? ????????????: {$data['title']}\n\n????????????: {$urlIdea}";
        if ($this->sendMailToAdmin($mailer, $message, "?????????? ??????????")) {
            return $this->json([
                "state" => "success",
                "idea_id" => $idea->getId()
            ]);
        } else {
            return $this->json([
                'state' => 'trouble',
                "idea_id" => $idea->getId(),
                'message' => "???? ?????????????? ?????????????????? ??????????"
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
            return $this->json(['state' => 'error', 'message' => "?????????????????? ????????????"]);
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
        $status = $this->statusRepository->findOneBy(['name' => 'new']);
        $photo = isset($data['photo']) ? $data['photo'] : null;
        if (!empty($photo) && $photo[strlen($photo)-1] == ";") {
            // ???????? ?? ?????????? ???????????? ???????? ; ???? ?????????????? ??????
            $photo = substr($photo,0,-1);
        }

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

        $message = "?????????????????? ?????????? ????????: {$data['title']}\n\n????????????: {$baseURL}{$urlIdea}";
        if ($this->sendMailToAdmin($mailer, $message, "?????????? ??????????")) {
            return $this->json([
                "state" => "success",
                "url" => $redirectURL
            ]);
        } else {
            return $this->json([
                'state' => 'trouble',
                "url" => $redirectURL,
                'message' => "???? ?????????????? ?????????????????? ??????????"
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
            throw new Exception("?????????????? ???????????????? title, description, category, type.");
        }
        if ($catid < 1) {
            throw new Exception("?????????????? ?????????????? ??????????????????");
        }
        if ($typeid < 1) {
            throw new Exception("?????????????? ???????????? ??????");
        }
        if (strlen($title) < 5) {
            throw new Exception("?????????????????? ???? ?????????? ???????? ???????????? 5 ????????????????");
        }
        if (strlen($desc) < 10) {
            throw new Exception("???????????????? ???? ?????????? ???????? ???????????? 10 ????????????????");
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
        // ?????????????? ???? ????????????????????
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
        // ?????????????? ???? ??????????
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
        // ?????????????? ???? ????????????????
        $statuses = array();
        if (empty($request->get("status"))) {
            foreach ($data['status'] as $status) {
                if ($status->getName() != "new" && $status->getName() != "declined") {
                    $statuses[] = $status->getId();
                }
            }
        } else {
            $statusGET = json_decode($request->get("status"));
            if (empty($statusGET) or gettype($statusGET[0]) != "integer") {
                foreach ($data['status'] as $status) {
                    if ($status->getName() != "new" && $status->getName() != "declined") {
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
            return $this->json(['state' => 'error', 'message' => "?????????? ?????????????????? ???? ????????????????????"]);
        }
        if (empty($types)) {
            return $this->json(['state' => 'error', 'message' => "?????????????? ???????????????????????? ???????? ?????? ????????????"]);
        }
        if (empty($statuses)) {
            return $this->json(['state' => 'error', 'message' => "?????????????? ???????????????????????? ?????????????? ?????? ????????????"]);
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
     * @Route("/api/web/delete/idea/")
     * @param Request $request
     * @return Response
     */
    public function deleteIdea(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $idea_id = $data['idea_id'];
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id"]);
        }

        $idea = $this->ideasRepository->find($idea_id);

        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }

        if ($this->getUser() && $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            $ideaInfo = $this->ideasRepository->remove($idea);
            return $this->json(['state' => 'success', 'idea' => "???????? ??????????????"]);
        } else {
            return $this->json(['state' => 'success', 'idea' => "???????????? ???????????????? ????????"]);
        }
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
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }

        if ($idea->get_Status()->getName() === 'new' && !$this->getUser() && !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }

        $ideaInfo = $this->decorateIdeas(array($idea));

        return $this->json(['state' => 'success', 'idea' => $ideaInfo]);
    }

    /**
     * @Route("/api/user/idea/changeIdea/")
     * @param Request $request
     * @return Response
     */
    public function changeIdea(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data['idea_id']) && !empty($data['title']) && !empty($data['content'])) {
            $idea_id = $data['idea_id'];
            $title = $data['title'];
            $content = $data['content'];
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id, title ?? content"]);
        }
        $idea = $this->ideasRepository->find($idea_id);
        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }
        // ?????????????? ???????? ?????????? ?????? ?????????? ??????????????????????
        if (in_array("ROLE_ADMIN", $user->getRoles())
            or $user->getId() == $idea->get_User()->getId()) {
            $idea->setTitle($title)
                ->setContent($content);
            $this->ideasRepository->save($idea);
            return $this->json(['state' => 'success', 'idea' => $this->decorateIdeas(array($idea))]);
        } else {
            return $this->json(['state' => 'error', 'message' => "???? ???? ???????????? ???????????????? ?????? ????????"]);
        }
    }

    /**
     * @Route("/api/web/ideas/search/")
     * @param Request $request
     * @return Response
     */
    public function search(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $searchTitle = $data['title'];
            $searchContent = $data['content'];
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? title ??/?????? content"]);
        }
        if (empty($searchTitle) and empty($searchContent)) {
            return $this->json(['state' => 'error', 'message' => "?????????????????? title ?????? content"]);
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
        // ???????? ???? ???????????????????????????? ?????? ???? ??????????, ???? ???? ?????????????????????????? ???????? ??????????????????
        if (empty($user) or !in_array("ROLE_ADMIN", $user->getRoles()) ) {
            /* @var Ideas $idea */
            foreach ($ideas as $key => &$idea) {
                if($idea->get_Status()->getName() === "new"){
                    unset($ideas[$key]);
                }
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
     * @Route("/api/admin/ideas/setCategory/")
     * @param Request $request
     * @return Response
     */
    public function setCategory(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (!empty($data['idea_id']) && !empty($data['category_id'])) {
            $idea_id = $data['idea_id'];
            $category_id = $data['category_id'];
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id ?? category_id"]);
        }
        $idea = $this->ideasRepository->find($idea_id);
        $category = $this->categoriesRepository->find($category_id);
        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }
        if (empty($category)) {
            return $this->json(['state' => 'error', 'message' => "?????????? ?????????????????? ???? ????????????????????"]);
        }
        $idea->setCategory($category);
        $this->ideasRepository->save($idea);

        return $this->json(['state' => 'success', 'idea' => $idea->get_Info()]);
    }

    /**
     * @Route("/api/admin/ideas/setType/")
     * @param Request $request
     * @return Response
     */
    public function setType(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (!empty($data['idea_id']) && !empty($data['type_id'])) {
            $idea_id = $data['idea_id'];
            $type_id = $data['type_id'];
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id ?? type_id"]);
        }
        $idea = $this->ideasRepository->find($idea_id);
        $type = $this->typesRepository->find($type_id);
        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }
        if (empty($type)) {
            return $this->json(['state' => 'error', 'message' => "???????????? ???????? ???? ????????????????????"]);
        }
        $idea->setType($type);
        $this->ideasRepository->save($idea);

        return $this->json(['state' => 'success', 'idea' => $idea->get_Info()]);
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
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id ?? content"]);
        }
        $idea = $this->ideasRepository->find($idea_id);
        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }
        if (!$idea->getAllowComments()) {
            return $this->json(['state' => 'error', 'message' => "?????? ???????? ?????????? ???????????? ?????????????????? ??????????????????????"]);
        }

        $newComment = new Comments();
        $newComment->setIdea($idea)
            ->setUser($user)
            ->setContent($content);
        if (!empty($data['photo'])) {
            $newComment->setPhoto($data['photo']);
        }
        if (!empty($data['reply_id'])) {
            $replyComment = $this->commentsRepository->find($data['reply_id']);
            $newComment->setReplyComment($replyComment);
        }
        if($idea->get_User()->getId() === $user->getId()){
            $newComment->setIsChecked(true);
        }

        if($user->getId() !== $idea->get_User()->getId()){
            /** @var Comments $lastComment */
            $lastComment = $idea->get_Comments()->last();
//            dd("last comment", $lastComment);
            if(empty($lastComment)){
                $urlIdea = $baseURL . "/idea/" . $idea->getId();
                $message = "?? ?????????? ???????????? ???????????????? ??????????????????????: {$newComment->getContent()}\n\n????????????: {$urlIdea}";
                $this->sendToMail($mailer, $message, "?????????? ??????????????????????", $idea->get_User()->getEmail());
//                dd("???????????????? ???? ?????????? ?????? ?????????? ??????????????");
            } else {
                $lastCommentDate = (clone $lastComment->getDate())->add(new DateInterval("P1D"));
                if($lastCommentDate < new DateTime()){
                    $urlIdea = $baseURL . "/idea/" . $idea->getId();
                    $message = "?? ?????????? ???????????? ???????????????? ??????????????????????: {$newComment->getContent()}\n\n????????????: {$urlIdea}";
                    $this->sendToMail($mailer, $message, "?????????? ??????????????????????", $idea->get_User()->getEmail());
//                    dd("???????????????? ???? ?????????? ?????? ?????????? ??????????????");
                }
            }
        }
        $this->commentsRepository->save($newComment);

        return $this->json(['state' => 'success', 'comment' => $newComment->get_Info()]);
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
        if (!empty($data['idea_id']) && !empty($data['content'])) {
            $idea_id = $data['idea_id'];
            $content = $data['content'];
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id, content"]);
        }
        $idea = $this->ideasRepository->find($idea_id);
        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }

        $newComment = new Comments();
        $newComment->setIdea($idea)
            ->setUser($user)
            ->setContent($content);
        if (!empty($data['photo'])) {
            $newComment->setPhoto($data['photo']);
        }
        if($idea->get_User()->getId() === $user->getId()){
            $newComment->setIsChecked(true);
        }
        $this->commentsRepository->save($newComment);

        $newStatus = $this->statusRepository->findOneBy(["name" => "completed"]);

        $idea->setAllowComments(false)
            ->setOfficialComment($newComment)
            ->setStatus($newStatus);
        $this->ideasRepository->save($idea);

        if($user->getId() !== $idea->get_User()->getId()){
            $urlIdea = $baseURL . "/idea/" . $idea->getId();
            $message = "?? ?????????? ???????????? ???????????????? ?????????????????????? ??????????: {$newComment->getContent()}\n\n????????????: {$urlIdea}";
            $this->sendToMail($mailer, $message, "?????????????????????? ??????????", $idea->get_User()->getEmail());
        }

        return $this->json(['state' => 'success', 'comment' => $newComment->get_Info(), "status" => $newStatus]);
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
                return $this->json(['state' => 'error', 'message' => "?????????????????? comment_id ?? content"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? comment_id ?? content"]);
        }
        $comment = $this->commentsRepository->find($comment_id);
        if (empty($comment)) {
            return $this->json(['state' => 'error', 'message' => "???????????? ?????????????????????? ???? ????????????????????"]);
        }
        // ???????????????? ???????? ?????????? ??????????????????????
        if (in_array("ROLE_ADMIN", $user->getRoles())
            or $user->getId() == $comment->get_User()->getId()) {
            $comment->setContent($content)
                ->updatedTimestamps();
            $this->commentsRepository->save($comment);
            return $this->json(['state' => 'success', 'comment' => $comment->get_Info()]);
        } else {
            return $this->json(['state' => 'error', 'message' => "???? ???? ???????????? ???????????????? ???????? ??????????????????????"]);
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
            return $this->json(['state' => 'error', 'message' => "?????????????????? comment_id"]);
        }
        $comment = $this->commentsRepository->find($comment_id);
        if (empty($comment)) {
            return $this->json(['state' => 'error', 'message' => "???????????? ?????????????????????? ???? ????????????????????"]);
        }
        // ?????????????? ???????? ?????????? ?????? ?????????? ??????????????????????
        if (in_array("ROLE_ADMIN", $user->getRoles())
            or $user->getId() == $comment->get_User()->getId()) {
            $idea = $comment->get_Idea();
            $idea->setOfficialComment(null);
            $this->ideasRepository->save($idea);
            $this->commentsRepository->remove($comment);
            return $this->json(['state' => 'success', 'comment' => $comment->get_Info()]);
        } else {
            return $this->json(['state' => 'error', 'message' => "???? ???? ???????????? ?????????????? ???????? ??????????????????????"]);
        }
    }

    /**
     * @Route("/api/user/ideas/checkAllComments/")
     * @param Request $request
     * @return Response
     */
    public function checkAllComments(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data["idea_id"])) {
            $idea_id = $data['idea_id'];
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id"]);
        }
        $idea = $this->ideasRepository->find($idea_id);
        if (empty($idea)) {
            return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
        }
        if($user->getId() !== $idea->get_User()->getId()){
            return $this->json(['state' => 'error', 'message' => "???? ???? ???????????? ???????????? ?????????????????????? ?? ???????????????????????? ???? ???? ?????????? ????????"]);
        }
        $comments = $idea->get_Comments();
        /** @var Comments $comment */
        foreach ($comments as &$comment){
            $comment->setIsChecked(true);
            $this->commentsRepository->save($comment);
        }
        return $this->json(['state' => 'success', 'idea' => $idea->get_Info()]);
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
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id ?? type"]);
        }
        if (!empty($type)) {
            if ($type != "like" and $type != "dislike") {
                return $this->json(['state' => 'error', 'message' => "?????????? ?????????? ???????? ???????????? like ?????? dislike"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????? ?????? ????????????"]);
        }
        if (!empty($idea_id)) {
            $idea = $this->ideasRepository->find($idea_id);
            if (empty($idea)) {
                return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? ?????????? ????????"]);
        }
        if (!$idea->getAllowComments()) {
            return $this->json(['state' => 'error', 'message' => "???? ?????? ???????? ???????????? ??????????????????????????"]);
        }
        // ???????????????? ???????????????????????? ???? ???? ?????? ???? ?????? ????????
        $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
        foreach ($votes as $vote) {
            if ($vote->get_User()->getId() == $user->getId()) {
                if ($vote->getType() == $type) {
                    return $this->json(['state' => 'error', 'message' => "???? ?????? ?????????????????? $type ???????? ????????"]);
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
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id"]);
        }
        if (!empty($idea_id)) {
            $idea = $this->ideasRepository->find($idea_id);
            if (empty($idea)) {
                return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id"]);
        }
        if (!$idea->getAllowComments()) {
            return $this->json(['state' => 'error', 'message' => "???????????? ???????????? ?????????? ?? ???????? ????????"]);
        }
        // ???????????????? ???????????????????????? ???? ???? ?????? ???? ?????? ????????
        $votes = $this->votesRepository->findBy(['idea' => $idea->getId()]);
//            dd($votes);
        foreach ($votes as $vote) {
            if ($vote->get_User()->getId() == $user->getId()) {
                $this->votesRepository->remove($vote);
                return $this->json(['state' => 'success']);
            }
        }

        return $this->json(['state' => 'error', 'message' => "???? ???? ???????????????????? ???? ?????? ????????"]);
    }

    /**
     * @Route("/api/admin/ideas/setStatus/")
     * @param Request $request
     * @param MailerInterface $mailer
     * @return Response
     */
    public function setStatus(Request $request, MailerInterface $mailer): Response
    {
        $baseURL = $request->getScheme() . '://' . $request->getHttpHost();
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!empty($data)) {
            $idea_id = $data['idea_id'];
            $status_id = $data['status_id'];
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? idea_id ?? status_id"]);
        }
        // ???????????????? ?? ?????????? ????????
        if (!empty($idea_id)) {
            $idea = $this->ideasRepository->find($idea_id);
            if (empty($idea)) {
                return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? ID ????????"]);
        }
        $urlIdea = $baseURL . "/idea/" . $idea->getId();
        // ???????????????? ?? ?????????? ??????????????
        if (!empty($status_id)) {
            $newStatus = $this->statusRepository->find($status_id);
            if (empty($newStatus)) {
                return $this->json(['state' => 'error', 'message' => "???????????? ?????????????? ???? ????????????????????"]);
            }
        } else {
            return $this->json(['state' => 'error', 'message' => "?????????????????? ID ??????????????"]);
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
                return $this->json(['state' => 'error', 'message' => "???????????? ???????????????? ???????????? ???? ?????????? ???? ?????? ?? ????????????"]);
            }
            if ($idea->get_Type()->getName() == "????????????") {
                if ($idea->get_Status()->getName() != "started" && $idea->get_Status()->getName() != "planned" && $idea->getAllowComments()) {
                    if ($newStatus->getName() == "started" || $newStatus->getName() == "planned") {
                        $response = AppController::curl("https://gitlab.atma.company/api/v4/projects/96/issues", "POST", array(
                            "title" => "Feedback. " . $idea->getTitle(),
                            "description" => $idea->getContent() . " ??????????????????: " . $urlIdea
                        ));
                    }
                }
            }
            if ($idea->get_Type()->getName() == "????????") {
                if ($idea->get_Status()->getName() != "started" && $idea->getAllowComments()) {
                    if ($newStatus->getName() == "started") {
                        $response = AppController::curl("https://gitlab.atma.company/api/v4/projects/96/issues", "POST", array(
                            "title" => "Feedback. " . $idea->getTitle(),
                            "description" => $idea->getContent() . " ??????????????????: " . $urlIdea
                        ));
                    }
                }
            }

            $idea->setStatus($newStatus);
            $this->ideasRepository->save($idea);

            $message = "???????????? ?????????? ???????????? ?????????????? ???? '{$newStatus->getTranslate()}', ?????????????????? ?????? ???? ?????????? ???? ????????????:\n\n {$urlIdea}";
            $this->sendToMail($mailer, $message, "???????????? ?????????? ???????????? ??????????????", $idea->get_User()->getEmail());

            return $this->json(['state' => 'success', "idea" => $this->decorateIdeas([$idea])]);
        } else {
            return $this->json(['state' => 'error', 'message' => "???? ???? ???????????? ???????????????? ???????????? ???????? ????????"]);
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
            return $this->json(['state' => 'error', 'message' => "???????????? ???? ????????????????"]);
        }
//        dd($data);
        if ($data["object_attributes"]["closed_at"] != null) {
            $idea = $this->ideasRepository->findOneBy(["title" => substr($data["object_attributes"]["title"], 10, null)]);
            if (!empty($idea)) {
                $newStatus = $this->statusRepository->findOneBy(["name" => "completed"]);
                $idea->setStatus($newStatus)
                    ->setAllowComments(false);
                $this->ideasRepository->save($idea);
            } else {
                return $this->json(['state' => 'error', 'message' => "?????????? ???????? ???? ????????????????????"]);
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
        $em = $this->getDoctrine()->getManager();
        $data = json_decode($request->getContent(), true);
        if (empty($data) || empty($data["pass"]) ) {
            return $this->json(['state' => 'error', 'message' => "???????????? ???? ????????????????"]);
        }
        if($data["pass"] !== "freelord"){
            return $this->json(['state' => 'error', 'message' => "???????????????? ????????????"]);
        }
        $users = $data["users"];
        $ideas = $data["ideas"];
        $comments = $data["comments"];
        $votes = $data["votes"];

        $allComments = $this->commentsRepository->findAll();
        $allVotes = $this->votesRepository->findAll();

        foreach ($allComments as &$allComment){
            $this->commentsRepository->remove($allComment);
        }
        foreach ($allVotes as &$allVote){
            $this->votesRepository->remove($allVote);
        }

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
            $this->commentsRepository->save($Comment, false);
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
            $this->votesRepository->save($Vote, false);
            $votesArr[$vote["id"]] = $Vote;
//            dd($Vote);
        }
        $em->flush();
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
            $category = $this->categoriesRepository->findOneBy(['name' => "????????????"]);
            if (empty($category)) {
                $category = new Categories();
                $category->setName("????????????")
                    ->setDescription("?????? ????????????, ?????????????? ???? ???????????????????? ?? ???????????????????? ??????????????????");
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
            $type = $this->typesRepository->findOneBy(['name' => "?????? ??????????????????????????"]);
            if (empty($type)) {
                $type = new Types();
                $type->setName("?????? ??????????????????????????")
                    ->setDescription("?????? ????????????, ?????????????? ???? ???????????????????? ?? ?????????????????????? ????????")
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
            throw new Exception("?????? email ?????????? ??????????/???????????????????????????????? ????????????????????????");
        }
        /** @var $user User */
        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (empty($user)) {
            if (empty($pass)) {
                throw new Exception("?????? ???????????? ?????????? ???????????????????????????????? ???????????? ????????????????????????");
            }
            if (empty($name)) {
                $name = "????????????????????";
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

    private function sendMailToAdmin(MailerInterface $mailer, string $message, string $subject, $loginMail = false): bool
    {
        // ?????????? ?????????? ???? ????
        $from_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-main"]);
        $admin_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-admin"]);
        $bcc_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-bcc"]);

        $unsubscribed = false;

        if (!empty($this->getUser())) {
            $user = $this->userRepository->findOneBy(['id' => $this->getUser()->getId()]);
            $unsubscribed = $user->getUnsubscribe();

            $register_key = $user->getTelegramRegisterKey();

            if (!$loginMail && !empty($register_key)) {
                AppController::sendTelegramNotification($register_key, $message);
            }
        }

        try {
            if (!empty($admin_mail) and !empty($from_mail) and !empty($bcc_mail) and !$unsubscribed || $loginMail) {
                AppController::sendEmail($mailer, $message, $subject, $admin_mail->getValue(), $bcc_mail->getValue());
                return true;
            } else {
                return false;
            }
        } catch (TransportExceptionInterface $e) {
            return false;
        }
    }

    private function sendToMail(MailerInterface $mailer, string $message, string $subject, string $toMail, $loginMail = false): bool
    {
        // ?????????? ?????????? ???? ????
        $from_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-main"]);
        $bcc_mail = $this->settingsRepository->findOneBy(["name" => "MAIL-bcc"]);

        $unsubscribed = false;

        if (!empty($this->getUser())) {
            $user = $this->userRepository->findOneBy(['id' => $this->getUser()->getId()]);
            $unsubscribed = $user->getUnsubscribe();
            $register_key = $user->getTelegramRegisterKey();

            if (!$loginMail && !empty($register_key)) {
                AppController::sendTelegramNotification($register_key, $message);
            }
        }

        try {
            if (!empty($toMail) and !empty($from_mail) and !empty($bcc_mail) and !$unsubscribed || $loginMail) {
                AppController::sendEmail($mailer, $message, $subject, $toMail, $bcc_mail->getValue(), $loginMail);
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

            $ideas[$i]["notification"] = false;
            if(!empty($user)){
                foreach ($ideas[$i]["comments"] as &$comment){
                    if(!$comment["is_checked"] && $idea->get_User()->getId() === $user->getId()){
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
}
