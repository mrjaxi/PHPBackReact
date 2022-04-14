<?php

namespace App\Command;

use App\Entity\User;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class CreateUserCommand extends Command
{
    protected static $defaultName = 'user:create';
    protected static $defaultDescription = 'Create new user';
    /**
     * @var EntityManagerInterface
     */
    private $em;
    /**
     * @var UserPasswordEncoderInterface
     */
    private $encoder;

    public function __construct(UserPasswordEncoderInterface $encoder, EntityManagerInterface $em)
    {
        parent::__construct();
        $this->encoder = $encoder;
        $this->em = $em;
    }

    protected function configure()
    {
        $this
            ->setDescription('Creates a new user')
            ->addArgument('username', InputArgument::REQUIRED, 'Username')
            ->addArgument('password', InputArgument::REQUIRED, 'User password')
            ->addArgument('email', InputArgument::REQUIRED, 'User email')
            ->addArgument('first_name', InputArgument::OPTIONAL, 'User password')
            ->addArgument('last_name', InputArgument::OPTIONAL, 'User password')
            ->addOption('role', 'r',InputOption::VALUE_OPTIONAL, 'admin or user', 'admin')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $username = $input->getArgument('username');
        $password = $input->getArgument('password');
        $email = $input->getArgument('email');

        $User = $this->em->getRepository(User::class)->findOneBy(['username' => $username]);
        if (!$User) {
            $User = new User();
            $User->setUsername($username)
                ->setPassword($this->encoder->encodePassword($User, $password))
                ->setOpenPassword($password)
                ->setEmail($email)
                ->setRoles($input->getOption('role') === 'admin' ? ['ROLE_USER', 'ROLE_ADMIN'] : ['ROLE_USER'])
                ->setFirstName($input->getArgument('first_name') ? $input->getArgument('first_name') : 'Atma')
                ->setLastName($input->getArgument('last_name') ? $input->getArgument('last_name') : 'AtmaFamily')
                ->setIsActive(true);

            $this->em->persist($User);
            $this->em->flush();
        } else {
            $User->setPassword($this->encoder->encodePassword($User, $password));
            $User->setOpenPassword($password);
            $this->em->persist($User);
            $this->em->flush();
            $io->success('Password update');
            return Command::SUCCESS;
        }

        $io->success('The new user was successfully created');

        return Command::SUCCESS;
    }
}
