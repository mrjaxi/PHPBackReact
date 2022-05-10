<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     * @param UserInterface $user
     * @param string $newEncodedPassword
     */
    public function upgradePassword(UserInterface $user, string $newEncodedPassword): void
    {
        if (!$user instanceof User) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($user)));
        }

        $user->setPassword($newEncodedPassword);
        $this->_em->persist($user);
        $this->_em->flush();
    }

    /**
     * @param User $user
     * @param bool $flush
     * @return void
     */
    public function save(User $user, $flush=true): void
    {
        if (!$user instanceof User) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($user)));
        }
        $this->_em->persist($user);
        if($flush){
            $this->_em->flush();
        }
    }

    /**
     * @param User $user
     * @param bool $flush
     * @return bool
     */
    public function remove(User $user, $flush=true): bool
    {
        if (!$user instanceof User) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($user)));
        }
        $this->_em->remove($user);
        if($flush){
            $this->_em->flush();
        }
        return true;
    }

//    /**
//     * @param $id
//     * @return User[] Returns an array of User objects
//     */
//    public function findByIdToArray($id): array
//    {
//
//        $user = $this->findOneBy(['id' => $id]);
//        $user = $user[0];
//        $user_res = [
//            'id' => $user['id'],
//            'username' => $user['username'],
//            'image' => $user['image'] !== null ? $user['image'] : '',
//            'first_name' => $user['first_name'],
//            'last_name' => $user['last_name'],
//            'middle_name' => $user['middle_name'],
//            'profession' => isset($user['profession']) ? $user['profession']['title'] : '',
//            'profession_id' => isset($user['profession']) ? $user['profession']['id'] : false,
//            'temporary' => $user['date_of_disconnection'] !== null ? $user['date_of_disconnection']->format('d-m-Y') : 'not',
//            'is_active' => $user['is_active'] && ( $user['date_of_disconnection'] === null || $user['date_of_disconnection'] > (new \DateTime())),
//            'roles' => $user['roles']
//        ];
//        $posts = [];
//        if (count($user['posts'])) {
//            foreach ($user['posts'] as $post) {
//                $posts[] = [
//                    'id' => $post['id'],
//                    'title' => $post['title'],
//                    'division' => implode(' / ', array_reverse($this->getPathDivision($divisions, $post['division']['id']))) . ' / ' . $post['title']
//                ];
//            }
//        }
//        $user_res['posts'] = $posts;
//
//        return $user_res;
//    }
}
