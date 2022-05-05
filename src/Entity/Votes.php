<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\VotesRepository;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=VotesRepository::class)
 */
#[ApiResource]
class Votes
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer", unique=true)
     */
    private $id;

    /**
     * @var DateTimeInterface
     * @ORM\Column(type="datetime")
     */
    private $date;

    /**
     * @var User|null
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="votes")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $user;

    /**
     * @var Ideas|null
     * @ORM\ManyToOne(targetEntity=Ideas::class, inversedBy="votes")
     * @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     */
    private $idea;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(DateTimeInterface $date): self
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
