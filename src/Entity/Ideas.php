<?php

namespace App\Entity;

use App\Repository\IdeasRepository;
use DateTime;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass=IdeasRepository::class)
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false, hardDelete=true)
 * @ORM\HasLifecycleCallbacks
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
     * @var DateTimeInterface $updated
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

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
     * @var Comments|null
     * @ORM\OneToOne(targetEntity=Comments::class, cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $official_comment;

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

    /**
     * @var DateTimeInterface|null
     * @ORM\Column(name="deletedAt", type="datetime", nullable=true)
     */
    private $deletedAt;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
        $this->votes = new ArrayCollection();
    }

    public function get_Info(): array
    {
        $info = array(
            "id" => $this->id,
            "title" => $this->title,
            "content" => $this->content,
            "likes" => $this->get_LikesCount(),
            "photo" => $this->photo,
            "href" => $this->href,
            "allowComments" => $this->allowComments,
            "status" => $this->status,
            "date" => $this->date->format('Y-m-d H:i:s'),
            "user" => $this->get_UserInfo(),
            "category" => $this->get_CategoryInfo(),
            "type" => $this->get_TypeInfo(),
            "officialComment" => null
        );
        if(!empty($this->official_comment)){
            $info["officialComment"] = $this->official_comment->get_Info();
        }
        return $info;
    }

    /**
     * @ORM\PrePersist
     */
    public function createdTimestamps(): void
    {
        if ($this->getDate() === null) {
            $this->setDate(new DateTime('now'));
        }
    }
    /**
     * @ORM\PreUpdate
     */
    public function updatedTimestamps(): void
    {
        $this->setUpdatedAt(new DateTime('now'));
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

    public function getDateFormat(): ?string
    {
        return $this->date->format('Y-m-d H:i:s');
    }

    public function getDate(): ?DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getUpdatedAt() : ?DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

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
    public function get_Comments()
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

    public function getOfficialComment(): ?Comments
    {
        return $this->official_comment;
    }

    public function setOfficialComment(?Comments $official_comment): self
    {
        $this->official_comment = $official_comment;

        return $this;
    }

    public function getDeletedAt()
    {
        return $this->deletedAt;
    }

    public function setDeletedAt($deletedAt)
    {
        $this->deletedAt = $deletedAt;
    }
}
