<?php

namespace App\DataFixtures;

use App\Entity\Categories;
use App\Entity\Types;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\ORM\EntityManagerInterface;

class TypeFixtures extends Fixture
{
    private $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function load(\Doctrine\Persistence\ObjectManager $manager)
    {
        $typesData = [
            0 => [
                'name' => 'Предложить идею',
            ],
            1 => [
                'name' => 'Сообщить о проблеме',
            ],
            2 => [
                'name' => 'Поблагодарить',
            ],
            3 => [
                'name' => 'Задать вопрос',
            ],
            4 => [
                'name' => 'Без классификации',
            ],
        ];

        foreach ($typesData as $type) {
            $newTypes = new Types();
            $newTypes->setName($type["name"]);

            $this->em->persist($newTypes);
        }

        $this->em->flush();
    }
}

