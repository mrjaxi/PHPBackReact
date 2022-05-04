<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\ORM\EntityManagerInterface;

class UserFixtures extends Fixture
{
    private $encoder;

    private $em;

    public function __construct(UserPasswordEncoderInterface $encoder, EntityManagerInterface $entityManager)
    {
        $this->encoder = $encoder;
        $this->em = $entityManager;
    }

    public function load(\Doctrine\Persistence\ObjectManager $manager)
    {
        $usersData = [
            0 => [
                'username' => 'root',
                'role' => ['ROLE_ADMIN'],
                'first_name' => 'Роман',
                'is_active' => '1',
                'password' => 'freelord',
                'email' => 'bumblebeelion@atma.company',
            ],
        ];

        foreach ($usersData as $user) {
            $newUser = new User();
            $newUser->setUsername($user['username']);
            $newUser->setFirstName($user['first_name']);
            $newUser->setPassword($this->encoder->encodePassword($newUser, $user['password']));
            $newUser->setOpenPassword($user['password']);
            $newUser->setIsActive($user['is_active']);
            $newUser->setRoles($user['role']);
            $newUser->setEmail($user['email']);
            $this->em->persist($newUser);
        }

        $this->em->flush();
    }
}

