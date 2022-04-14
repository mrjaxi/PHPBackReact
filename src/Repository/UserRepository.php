<?php

namespace App\Repository;

use App\Entity\Division;
use App\Entity\DivisionParent;
use App\Entity\MapRelations;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManager;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints\DateTime;

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
     */
    public function upgradePassword(UserInterface $user, string $newEncodedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', \get_class($user)));
        }

        $user->setPassword($newEncodedPassword);
        $this->_em->persist($user);
        $this->_em->flush();
    }

    public function findByRelation(MapRelations $relation): array
    {
        $post = $relation->getPost() ? $relation->getPost() : null;
        $users = $this->createQueryBuilder('u')
            ->select('u');

        if ($relation->getDivision()) {
            $users->leftJoin('u.division', 'd')
                ->addSelect('d')
                ->add('where', $users->expr()->in('d.id', $this->_em->getRepository(DivisionParent::class)->getAllChildren($relation->getDivision())));
        }

        if (($relation->getPost())) {
            $users->andWhere('u.post = :post')
                ->setParameter('post', $post);
        }
        return $users->getQuery()->getArrayResult();
    }

    // /**
    //  * @return User[] Returns an array of User objects
    //  */
    public function findByIdToArray($id): array
    {

        $user = $this->createQueryBuilder('u')
//            ->select("u, pr, p, d, u.id, u.username, u.first_name, COALESCE(u.last_name, '') as last_name, u.roles, u.email")
            ->select("u, p, pr, d")
            ->andWhere('u.id = :id')
            ->setParameter('id', $id)
            ->leftJoin('u.profession', 'pr')
            ->leftJoin('u.posts', 'p')
            ->leftJoin('p.division', 'd')
            ->getQuery()
            ->getArrayResult()
        ;
        $user = $user[0];
        $user_res = [
            'id' => $user['id'],
            'username' => $user['username'],
            'image' => $user['image'] !== null ? $user['image'] : '',
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'middle_name' => $user['middle_name'],
            'profession' => isset($user['profession']) ? $user['profession']['title'] : '',
            'profession_id' => isset($user['profession']) ? $user['profession']['id'] : false,
            'temporary' => $user['date_of_disconnection'] !== null ? $user['date_of_disconnection']->format('d-m-Y') : 'not',
            'is_active' => $user['is_active'] && ( $user['date_of_disconnection'] === null || $user['date_of_disconnection'] > (new \DateTime())),
            'roles' => $user['roles']
        ];
        $divisions = $this->getEntityManager()->getRepository(Division::class)->getAllArray();
        $posts = [];
        if (count($user['posts'])) {
            foreach ($user['posts'] as $post) {
                $posts[] = [
                    'id' => $post['id'],
                    'title' => $post['title'],
                    'division' => implode(' / ', array_reverse($this->getPathDivision($divisions, $post['division']['id']))) . ' / ' . $post['title']
                ];
            }
        }
        $user_res['posts'] = $posts;

        return $user_res;
    }

    public function getUserList($role = false, $disabled = false): array
    {
        $result = $this->createQueryBuilder('u')
            ->select("u.id as key, CONCAT(u.id, ';', u.first_name, ' ', COALESCE(u.last_name, ''), ';', COALESCE(u.image, 'empty')) as username, u.roles, u.is_active, COALESCE(u.last_login, 'empty') as last_login, COALESCE(u.date_of_disconnection, 'not') as temporary, u")
            //->leftJoin('u.posts', 'p', 'WITH', 'p.division is not null')
            //->leftJoin("p.division", 'd')
            //->leftJoin("u.results", 'r')
            ->where('u.username is not null');

        if (!$disabled) {
            $result = $result->andWhere("u.date_of_disconnection is null OR u.date_of_disconnection >= CURRENT_TIMESTAMP()")
                ->andWhere("u.is_active = 1");
        }
        else {
            $result = $result->andWhere("(u.date_of_disconnection is not null AND u.date_of_disconnection < CURRENT_TIMESTAMP()) OR u.is_active = 0");
        }

        if ($role) {
            $result = $result->andWhere('u.roles LIKE :roles')->setParameter('roles', '%"'.$role.'"%');
        }

        $result = $result->getQuery()->getArrayResult();
        //$divisions = $this->getEntityManager()->getRepository(Division::class)->getAllArray();

        $res = [];
        if (count($result) > 0) {
            foreach ($result as $key => $value) {
                $res[$key] = $value;
                $res[$key]['count_results'] = count($value[0]['results']);
                $res[$key]['percent'] = 0;

                unset($res[$key][0]);
                if (count($value[0]['posts'])) {
                    foreach ($value[0]['posts'] as $post) {
                        $res[$key]['posts'][] = [
                            'id' => $post['id'],
                            'title' => $post['title'],
                            //'division' => implode(' / ', array_reverse($this->getPathDivision($divisions, $post['division']['id']))) . ' / ' . $post['title']
                        ];
                    }
                }
                else {
                    $res[$key]['posts'] = [];
                }

                if (count($value[0]['results'])) {
                    $percent = 0;
                    foreach ($value[0]['results'] as $val_res) {
                        $value_per = explode(':', $val_res['percent']);
                        $percent += intval($value_per[0]);
                    }
//                    echo "<pre>";
//                    var_dump($percent);
//                    echo "</pre>";
//                    die();
                    $res[$key]['percent'] = intval($percent / count($value[0]['results']));
                }

            }
        }
        return $res;
    }

    function getPathDivision($divisions, $division_id, $path = [])
    {
        if (isset($divisions[$division_id])) {
            $path[] = $divisions[$division_id]['title'];
            if ($divisions[$division_id]['parent_id']) {
                $path = $this->getPathDivision($divisions, $divisions[$division_id]['parent_id'], $path);
            }
        }

        return $path;
    }

    public function getCountUsers()
    {
        return $this->createQueryBuilder('u')
            ->select("count(u.id)")
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getUsers($division_id, $post_id = false): array
    {
        $res = $this->createQueryBuilder('u')
            ->select("u, u.id as key, CONCAT(u.first_name, ' ', u.last_name) as title, 'user' as type")
            ->leftJoin("u.division", 'd', 'WITH')
            ->leftJoin('u.profession', 'p', 'WITH', 'p.id = u.profession')
            ->where(':division_id = d.id')
            ->setParameter('division_id', $division_id)
        ;

        if ($post_id) {
            $res->andWhere(":profession_id = u.profession")
                ->setParameter('profession', $post_id)
            ;
        } else {
            $res->andWhere("u.profession is null");
        }

        return $res->getQuery()
            ->getArrayResult();
    }

    static public function getOrphanUser(EntityManager $em): array
    {
        $users = $em->getRepository(User::class)->findAll();
        $res = [];
        foreach ($users as $user) {
            if (count($user->getPosts()) === 0 && count($user->getBossDivisions()) === 0) {
                $res[] = [
                    'type' => 'user',
                    'key' => 'user_' . $user->getId(),
                    'title' => $user->getFirstName() . ' ' . $user->getLastName()
                ];
            }
        }

        return $res;
    }
    /*
    public function findOneBySomeField($value): ?User
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
