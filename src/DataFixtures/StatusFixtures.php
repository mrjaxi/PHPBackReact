<?php

namespace App\DataFixtures;

use App\Entity\Categories;
use App\Entity\Status;
use App\Entity\Types;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\ORM\EntityManagerInterface;

class StatusFixtures extends Fixture
{
    private $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function load(\Doctrine\Persistence\ObjectManager $manager)
    {
        $statusData = [
            0 => [
                'name' => 'completed',
                'translate' => "Завершено",
                "color" => "#42C82C",
            ],
            1 => [
                'name' => 'started',
                'translate' => "Начато",
                "color" => "#3D72ED",
            ],
            2 => [
                'name' => 'planned',
                'translate' => "Запланировано",
                "color" => "#F6BA59",
            ],
            3 => [
                'name' => 'considered',
                'translate' => "Рассмотрено",
                "color" => "#CCD1D9",
            ],
            4 => [
                'name' => 'declined',
                'translate' => "Отклонено",
                "color" => "#EE505A",
            ],
            5 => [
                'name' => 'new',
                'translate' => "Не рассмотрено",
                "color" => "#CCD1D9",
            ],
        ];

        foreach ($statusData as $status) {
            $newStatus = new Status();
            $newStatus->setName($status["name"])
                ->setTranslate($status["translate"])
                ->setColor($status["color"]);

            $this->em->persist($newStatus);
        }

        $this->em->flush();
    }
}

