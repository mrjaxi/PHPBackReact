<?php

namespace App\DataFixtures;

use App\Entity\Categories;
use App\Entity\Settings;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use App\Entity\User;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\ORM\EntityManagerInterface;

class SettingsFixtures extends Fixture
{
    private $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function load(\Doctrine\Persistence\ObjectManager $manager)
    {
        $settingsData = [
            0 => [
                'name' => 'title',
                'value' => 'Atmaguru FeedBack',
            ],
            1 => [
                'name' => 'smtp-host',
                'value' => '127.0.0.1',
            ],
            2 => [
                'name' => 'smtp-port',
                'value' => '25',
            ],
            3 => [
                'name' => 'MAIL-main',
                'value' => 'feedback@atmadev.ru',
            ],
            4 => [
                'name' => 'MAIL-bcc',
                'value' => 'bumblebeelion@atma.company',
            ],
            5 => [
                'name' => 'MAIL-admin',
                'value' => 'damedvedev@atmapro.ru',
            ],
            6 => [
                'name' => 'atmaguru-domen',
                'value' => 'https://ag.atmadev.ru',
            ],
        ];

        foreach ($settingsData as $settings) {
            $newSettings = new Settings();
            $newSettings->setName($settings["name"])
                ->setValue($settings["value"]);

            $this->em->persist($newSettings);
        }

        $this->em->flush();
    }
}

