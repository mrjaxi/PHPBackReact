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
     * @var string
     * @ORM\Column(type="string", length=50)
     */
    private $type;

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

    public function get_Info(): array
    {
        return array(
            'id' => $this->id,
            'date' => $this->date,
            'type' => $this->type,
            'user' => $this->user->get_Profile(),
            'idea' => $this->idea->get_Info(),
        );
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?string
    {
        return $this->date->format('Y-m-d H:i:s');
    }

    public function setDate(DateTimeInterface $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(?string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function get_UserInfo(): array
    {
        return $this->user->get_Profile();
    }
    public function get_User(): ?User
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
