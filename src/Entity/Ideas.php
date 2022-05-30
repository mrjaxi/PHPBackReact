<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\IdeasRepository;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Cache\CacheException;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\PropertyInfo\Type;

/**
 * @ORM\Entity(repositoryClass=IdeasRepository::class)
 */
#[ApiResource]
class Ideas
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer", unique=true)
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $title;

    /**
     * @ORM\Column(type="text")
     */
    private $content;

    /**
     * @var DateTimeInterface
     * @ORM\Column(type="datetime")
     */
    private $date;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $photo;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $href;

    /**
     * @ORM\Column(type="boolean", options={"default" : true})
     */
    private $allowComments = true;

    /**
     * @var User|null
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="ideas")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $user;

    /**
     * @var Status|null
     * @ORM\ManyToOne(targetEntity=Status::class, inversedBy="ideas")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $status;

    /**
     * @var Categories|null
     * @ORM\ManyToOne(targetEntity=Categories::class, inversedBy="ideas")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $category;

    /**
     * @var Types|null
     * @ORM\ManyToOne(targetEntity=Types::class, inversedBy="ideas")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $type;

    /**
     * @var ArrayCollection<int, Comments>
     * @ORM\OneToMany(targetEntity=Comments::class, mappedBy="idea")
     */
    private $comments;

    /**
     * @var ArrayCollection<int, Votes>
     * @ORM\OneToMany(targetEntity=Votes::class, mappedBy="idea")
     */
    private $votes;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
        $this->votes = new ArrayCollection();
    }

    public function get_Info(): array
    {
        return [
            "id" => $this->id,
            "title" => $this->title,
            "content" => $this->content,
            "likes" => $this->get_LikesCount(),
            "photo" => $this->photo,
            "href" => $this->href,
            "comments" => $this->get_CommentsArray(),
            "allowComments" => $this->allowComments,
            "status" => $this->status,
            "date" => $this->date->format('Y-m-d H:i:s'),
            "user" => $this->get_UserInfo(),
            "category" => $this->get_CategoryInfo(),
            "type" => $this->get_TypeInfo(),
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;

        return $this;
    }

    public function getDate(): ?string
    {
        return $this->date->format('Y-m-d H:i:s');
    }

    public function setDate(\DateTimeInterface $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): self
    {
        $this->photo = $photo;

        return $this;
    }

    public function getHref(): ?string
    {
        return $this->href;
    }

    public function setHref(?string $href): self
    {
        $this->href = $href;

        return $this;
    }

    public function getAllowComments(): ?bool
    {
        return $this->allowComments;
    }

    public function setAllowComments(bool $allowComments): self
    {
        $this->allowComments = $allowComments;

        return $this;
    }

    public function get_UserInfo(): array
    {
        return $this->user->get_Profile();
    }

    public function get_User(): User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function get_Category(): Categories
    {
        return $this->category;
    }

    public function get_CategoryInfo(): array
    {
        return $this->category->get_Info();
    }

    public function setCategory(?Categories $category): self
    {
        $this->category = $category;

        return $this;
    }
    public function get_Type(): Types
    {
        return $this->type;
    }

    public function get_TypeInfo(): array
    {
        return $this->type->get_Info();
    }

    public function setType(?Types $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function get_Status(): ?Status
    {
        return $this->status;
    }

    public function setStatus(?Status $status): self
    {
        $this->status = $status;

        return $this;
    }

    /**
     * @return array
     */
    public function get_CommentsArray(): array
    {
        $commentsArray = array();
        /** @var Comments $comment */
        foreach ($this->comments as $comment) {
            $commentsArray[] = $comment->get_Info();
        }
        return $commentsArray;
    }

    /**
     * @return ArrayCollection
     */
    public function get_Comments(): ArrayCollection
    {
        return $this->comments;
    }

    public function addComment(Comments $comment): self
    {
        if (!$this->comments->contains($comment)) {
            $this->comments[] = $comment;
            $comment->setIdea($this);
        }

        return $this;
    }

    public function removeComment(Comments $comment): self
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->get_Idea() === $this) {
                $comment->setIdea(null);
            }
        }

        return $this;
    }
    /**
     * @return int|null
     */
    public function getVotes(): ?int
    {
        return $this->votes->count();
    }

    /**
     * @return int
     */
    public function get_LikesCount(): ?int
    {
        $likes = 0;
        if($this->votes->count() == $likes) {
            return $likes;
        } else {
            /** @var Votes $vote */
            foreach ($this->votes as $id => $vote){
                if($vote->getType() == 'like'){
                    $likes++;
                }
            }
            return $likes;
        }
    }

    /**
     * @return ArrayCollection
     */
    public function get_Votes(): ArrayCollection
    {
        return $this->votes;
    }

    public function addVote(Votes $vote): self
    {
        if (!$this->votes->contains($vote)) {
            $this->votes[] = $vote;
            $vote->setIdea($this);
        }

        return $this;
    }

    public function removeVote(Votes $vote): self
    {
        if ($this->votes->removeElement($vote)) {
            // set the owning side to null (unless already changed)
            if ($vote->get_Idea() === $this) {
                $vote->setIdea(null);
            }
        }

        return $this;
    }
}
