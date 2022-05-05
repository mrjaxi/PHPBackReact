<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\CommentsRepository;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=CommentsRepository::class)
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
     * @var DateTimeInterface
     * @ORM\Column(type="datetime")
     */
    private $date;

    /**
     * @var User|null
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="comments")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $user;

    /**
     * @var Ideas|null
     * @ORM\ManyToOne(targetEntity=Ideas::class, inversedBy="comments")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $idea;

    public function getInfo(): ?array
    {
        return [
            "id" => $this->id,
            "content" => $this->content,
            "date" => $this->date,
            "user" => $this->getUserInfo(),
        ];
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

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getUserInfo(): array
    {
        return $this->user->getProfile();
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getIdeaInfo(): array
    {
        return $this->idea->getInfo();
    }

    public function setIdea(?Ideas $idea): self
    {
        $this->idea = $idea;

        return $this;
    }
}
