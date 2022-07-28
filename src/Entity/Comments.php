<?php

namespace App\Entity;

use App\Repository\CommentsRepository;
use DateTime;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass=CommentsRepository::class)
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false, hardDelete=true)
 * @ORM\HasLifecycleCallbacks
 */
#[ApiResource]
class Comments
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer", unique=true)
     */
    private $id;

    /**
     * @ORM\Column(type="text")
     */
    private $content;

    /**
     * @var DateTimeInterface $date
     * @ORM\Column(type="datetime")
     */
    private $date;

    /**
     * @var DateTimeInterface|null $updated
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @var DateTimeInterface|null
     * @ORM\Column(name="deletedAt", type="datetime", nullable=true)
     */
    private $deletedAt;

    /**
     * @var User|null
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="comments")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $user;

    /**
     * @var Ideas|null
     * @ORM\ManyToOne(targetEntity=Ideas::class, inversedBy="comments")
     * @ORM\JoinColumn(nullable=true, onDelete="CASCADE")
     */
    private $idea;

    /**
     * @ORM\Column(type="boolean", options={"default" : false})
     */
    private $is_checked = false;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $photo;

    /**
     * @var Comments|null
     * @ORM\ManyToOne(targetEntity=Comments::class, inversedBy="reply_comments")
     */
    private $replyComment;

    /**
     * @var ArrayCollection<int, Comments>
     * @ORM\OneToMany(targetEntity=Comments::class, mappedBy="replyComment")
     */
    private $reply_comments;

    public function __construct()
    {
        $this->reply_comments = new ArrayCollection();
    }

    public function get_Info($idea=false): ?array
    {
        if (!empty($this->getDeletedAt())) {
            $info = [
                "id" => $this->id,
                "content" => "Комментарий удалён",
                "photo" => null,
                "date" => $this->getDateFormat(),
                "is_checked" => true,
                "user" => $this->get_UserInfo(),
                "updated" => null,
                "reply_comment" => null,
                "replies" => $this->getReplyComments()->count(),
            ];
        } else {
            $info = [
                "id" => $this->id,
                "content" => $this->content,
                "photo" => $this->photo,
                "date" => $this->date->format('Y-m-d H:i:s'),
                "is_checked" => $this->is_checked,
                "user" => $this->get_UserInfo(),
                "updated" => null,
                "reply_comment" => null,
                "replies" => $this->reply_comments->count(),
            ];
        }
        if ($idea) {
            $info['idea'] = $this->idea;
        }
        if (!empty($this->updatedAt)) {
            $info['updated'] = $this->updatedAt->format('Y-m-d H:i:s');
        }
        if (!empty($this->replyComment)) {
//            dd("not empty");
            try {
                $isDeleted = !empty($this->replyComment->getDeletedAt());
                if ($isDeleted) {
//                    dd("not empty getDeletedAt");
                    $info["reply_comment"] = array(
                        "id" => $this->replyComment->getId(),
                        "content" => "Комментарий удалён",
                        "photo" => null,
                        "date" => $this->replyComment->getDateFormat(),
                        "is_checked" => true,
                        "user" => $this->replyComment->get_UserInfo(),
                        "updated" => null,
                        "reply_comment" => null,
                        "replies" => $this->replyComment->getReplyComments()->count(),
                    );
                } else {
                    $info["reply_comment"] = $this->replyComment->get_Info();
                }
            } catch (\Exception $exception) {
//                dd($this->replyComment);
                $info["reply_comment"] = array(
                    "id" => $this->replyComment->getId(),
                    "content" => "Комментарий удалён",
                    "photo" => null,
                    "date" => null,
                    "is_checked" => true,
                    "user" => "Пользователь",
                    "updated" => null,
                    "reply_comment" => null,
                    "replies" => 0,
                );
            }
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

    public function updatedTimestamps(): void
    {
        $this->setUpdatedAt(new DateTime('now'));
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getUpdatedAt() : DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getIsChecked(): ?bool
    {
        return $this->is_checked;
    }

    public function setIsChecked(bool $is_checked): self
    {
        $this->is_checked = $is_checked;

        return $this;
    }

    public function get_UserInfo(): array
    {
        if($this->user){
            return $this->user->get_Profile();
        } else {
            return [];
        }
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

    public function get_IdeaInfo(): array
    {
        return $this->idea->get_Info();
    }

    public function get_Idea(): Ideas
    {
        return $this->idea;
    }

    public function setIdea(?Ideas $idea): self
    {
        $this->idea = $idea;

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

    public function getReplyComment(): ?self
    {
        return $this->replyComment;
    }

    public function setReplyComment(?self $replyComments): self
    {
        $this->replyComment = $replyComments;

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getReplyComments(): Collection
    {
        return $this->reply_comments;
    }

    public function addReplyComments(self $replyComment): self
    {
        if (!$this->reply_comments->contains($replyComment)) {
            $this->reply_comments[] = $replyComment;
            $replyComment->setReplyComment($this);
        }

        return $this;
    }

    public function removeReplyComments(self $replyComment): self
    {
        if ($this->reply_comments->removeElement($replyComment)) {
            // set the owning side to null (unless already changed)
            if ($replyComment->getReplyComments() === $this) {
                $replyComment->setReplyComment(null);
            }
        }

        return $this;
    }

    public function getDeletedAt(): ?DateTimeInterface
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?DateTimeInterface $deletedAt): void
    {
        $this->deletedAt = $deletedAt;
    }
}
