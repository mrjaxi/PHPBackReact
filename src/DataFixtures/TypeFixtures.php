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
                "color" => "#3D72ED",
            ],
            1 => [
                'name' => 'Сообщить о проблеме',
                "color" => "#EE505A",
            ],
            2 => [
                'name' => 'Поблагодарить',
                "color" => "#42C82C",
            ],
            3 => [
                'name' => 'Задать вопрос',
                "color" => "#F88545",
            ],
            4 => [
                'name' => 'Без классификации',
                "color" => "#2B2D33",
            ],
        ];

        foreach ($typesData as $type) {
            $newType = new Types();
            $newType->setName($type["name"])
                ->setColor($type["color"]);

            $this->em->persist($newType);
        }

        $this->em->flush();
    }
}

