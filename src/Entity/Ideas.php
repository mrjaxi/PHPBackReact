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
     * @ORM\Column(type="integer", options={"default" : 0})
     */
    private $votes = 0;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $photo;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $href;

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
     * @var Collection<int, Comments>
     * @ORM\OneToMany(targetEntity=Comments::class, mappedBy="idea")
     */
    private $comments;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
    }

    public function getInfo(): array
    {
        return [
            "id" => $this->id,
            "title" => $this->title,
            "content" => $this->content,
            "votes" => $this->votes,
            "photo" => $this->photo,
            "href" => $this->href,
            "status" => $this->status->getName(),
            "date" => $this->date->format('Y-m-d H:i:s'),
            "user" => $this->getUserInfo(),
            "category" => $this->getCategoryInfo(),
            "type" => $this->getTypeInfo(),
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

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getVotes(): ?int
    {
        return $this->votes;
    }

    public function setVotes(int $votes): self
    {
        $this->votes = $votes;

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

    public function getUserInfo(): array
    {
        return $this->user->getProfile();
    }


    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function categoryEntity(): Categories
    {
        return $this->category;
    }

    public function getCategoryInfo(): array
    {
        return $this->category->getInfo();
    }

    public function setCategory(?Categories $category): self
    {
        $this->category = $category;

        return $this;
    }

    public function typeEntity(): Types
    {
        return $this->type;
    }
    public function getTypeInfo(): array
    {
        return $this->type->getInfo();
    }

    public function setType(?Types $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getStatus(): ?Status
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
    public function getCommentsArray(): array
    {
        $commentsArray = array();
        foreach ($this->comments as $comment) {
            $commentsArray[] = $comment->getInfo();
        }
        return $commentsArray;
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
            if ($comment->getIdea() === $this) {
                $comment->setIdea(null);
            }
        }

        return $this;
    }
}
