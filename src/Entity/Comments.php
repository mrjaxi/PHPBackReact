<?php

namespace App\Entity;

use App\Repository\CommentsRepository;
use DateTime;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=CommentsRepository::class)
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
     * @var DateTimeInterface $updated
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

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

    public function get_Info($idea=false): ?array
    {
        $info = [
            "id" => $this->id,
            "content" => $this->content,
            "date" => $this->date->format('Y-m-d H:i:s'),
            "is_checked" => $this->is_checked,
            "user" => $this->get_UserInfo(),
        ];
        if($idea){
            $info['idea'] = $this->idea;
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
}
