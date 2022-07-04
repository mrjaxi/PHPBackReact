<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 * @method string getUserIdentifier()
 */

class User implements UserInterface
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer", unique=true)
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     */
    private $username;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $first_name;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $middle_name;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $last_name;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $email;

    /**
     * @var string The hashed password
     * @ORM\Column(type="string")
     */
    private $password;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $open_password;

    /**
     * @ORM\Column(type="json")
     */
    private $roles = [];

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $phone;

    /**
     * @ORM\Column(type="boolean")
     */
    private $is_active;

    /**
     * @ORM\Column(type="string", length=1000, nullable=true)
     */
    private $image;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $system_id;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $last_auth;

    /**
     * @var ArrayCollection<int, Ideas>
     * @ORM\OneToMany(targetEntity=Ideas::class, mappedBy="user")
     */
    private $ideas;

    /**
     * @var ArrayCollection<int, Comments>
     * @ORM\OneToMany(targetEntity=Comments::class, mappedBy="user")
     */
    private $comments;

    /**
     * @var ArrayCollection<int, Votes>
     * @ORM\OneToMany(targetEntity=Votes::class, mappedBy="user")
     */
    private $votes;

    public function __construct()
    {
        $this->ideas = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->votes = new ArrayCollection();
    }

    public function get_Profile(): ?array
    {
        // Проверка на то, есть ли непрочитанные комментарии к идеям пользователя
        $ideas = $this->get_Ideas();
        $commentsNotifications = false;
        /** @var Ideas $idea*/
        foreach ($ideas as &$idea){
            $comments = $idea->get_Comments();
            /** @var Comments $comment*/
            foreach ($comments as &$comment){
                if(!$comment->getIsChecked()){
                    $commentsNotifications = true;
                    break;
                }
            }
            if($commentsNotifications === true){
                break;
            }
        }
        return array(
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'roles' => $this->roles,
            'role_name' => $this->get_Role_Name(),
            'first_name' => $this->first_name,
            "middle_name" => $this->middle_name,
            "last_name" => $this->last_name,
            "image" => $this->image,
            "is_active" => $this->is_active,
            "system_id" => $this->system_id,
            "notifications" => $commentsNotifications
        );
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return (string) $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->first_name;
    }

    public function setFirstName(?string $first_name): self
    {
        $this->first_name = $first_name;

        return $this;
    }

    public function getMiddleName(): ?string
    {
        return $this->middle_name;
    }

    public function setMiddleName(?string $middle_name): self
    {
        $this->middle_name = $middle_name;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->last_name;
    }

    public function setLastName(?string $last_name): self
    {
        $this->last_name = $last_name;

        return $this;
    }

    public function get_Role_Name(): ?string
    {
        $roles = $this->roles;
        if(in_array("ROLE_ADMIN", $roles)){
            $name = "Администратор";
        } else if(in_array("ROLE_DEVELOPER", $roles)){
            $name = "Разработчик";
        } else if(in_array("ROLE_USER", $roles)){
            $name = "Генератор идей";
        } else {
            $name = "Самозванец";
        }

        return $name;
    }
    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_values(array_unique($roles));
    }

    public function setRoles(array $roles): self
    {
        $this->roles = array_values(array_unique($roles));

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getPassword(): string
    {
        return (string) $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getOpenPassword(): ?string
    {
        return $this->open_password;
    }

    public function setOpenPassword(string $open_password): self
    {
        $this->open_password = $open_password;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    public function getIsActive(): ?bool
    {
        return $this->is_active;
    }

    public function setIsActive(bool $is_active): self
    {
        $this->is_active = $is_active;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): self
    {
        $this->image = $image;

        return $this;
    }

    public function getSystemId(): ?int
    {
        return $this->system_id;
    }

    public function setSystemId(?int $system_id): self
    {
        $this->system_id = $system_id;

        return $this;
    }

    public function getLastAuth(): ?\DateTimeInterface
    {
        return $this->last_auth;
    }

    public function setLastAuth(?\DateTimeInterface $last_auth): self
    {
        $this->last_auth = $last_auth;

        return $this;
    }

    /**
     * @return array
     */
    public function get_IdeasArray(): array
    {
        $ideasArray = array();
        /** @var Ideas $idea */
        foreach ($this->ideas as $idea) {
            $ideasArray[] = $idea->get_Info();
        }
        return $ideasArray;
    }

    /**
     * @return Collection
     */
    public function get_Ideas(): Collection
    {
        return $this->ideas;
    }

    public function addIdea(Ideas $idea): self
    {
        if (!$this->ideas->contains($idea)) {
            $this->ideas[] = $idea;
            $idea->setUser($this);
        }

        return $this;
    }

    public function removeIdea(Ideas $idea): self
    {
        if ($this->ideas->removeElement($idea)) {
            // set the owning side to null (unless already changed)
            if ($idea->get_User() === $this) {
                $idea->setUser(null);
            }
        }

        return $this;
    }
    /**
     * @return array
     */
    public function get_CommentsArray($getIdea=false): array
    {
        $commentsArray = array();
        /** @var Comments $comment */
        foreach ($this->comments as $comment) {
            $commentsArray[] = $comment->get_Info($getIdea);
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
            $comment->setUser($this);
        }

        return $this;
    }

    public function removeComment(Comments $comment): self
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->get_User() === $this) {
                $comment->setUser(null);
            }
        }

        return $this;
    }
    /**
     * @return array|null
     */
    public function get_VotesArray($getIdea=false): ?array
    {
        $votesArray = array();
        /** @var Votes $vote */
        foreach ($this->votes as $vote) {
            $votesArray[] = $vote->get_Info($getIdea);
        }
        return $votesArray;
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
            $vote->setUser($this);
        }

        return $this;
    }

    public function removeVote(Votes $vote): self
    {
        if ($this->votes->removeElement($vote)) {
            // set the owning side to null (unless already changed)
            if ($vote->get_User() === $this) {
                $vote->setUser(null);
            }
        }

        return $this;
    }

    /**
     * Returning a salt is only needed, if you are not using a modern
     * hashing algorithm (e.g. bcrypt or sodium) in your security.yaml.
     *
     * @see UserInterface
     */
    public function getSalt(): ?string
    {
        return null;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }
    public function __call($name, $arguments)
    {
        // Implement @method string getUserIdentifier()
    }
}
