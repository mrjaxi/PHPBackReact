<?php

namespace App\DataFixtures;

use App\Entity\Categories;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\ORM\EntityManagerInterface;

class CategoryFixtures extends Fixture
{
    private $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function load(\Doctrine\Persistence\ObjectManager $manager)
    {
        $categoriesData = [
            0 => [
                'name' => 'Методология',
                'description' => "Все что связано с методологией создания эффективного корпоративного обучения"
            ],
            1 => [
                'name' => 'Приложение',
                'description' => "Все что связано с Приложением"
            ],
            2 => [
                'name' => 'Платформа',
                'description' => "Все что касается администрирования системы, создания новых карт и прохождение в веб-версии"
            ],
            3 => [
                'name' => 'Прочее',
                'description' => "Все записи, которые не определили к конкретной категории"
            ],
        ];

        foreach ($categoriesData as $category) {
            $newCategory = new Categories();
            $newCategory->setName($category["name"])
                ->setDescription($category["description"]);

            $this->em->persist($newCategory);
        }

        $this->em->flush();
    }
}

