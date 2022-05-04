<?php

namespace App\Repository;

use App\Entity\Ideas;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Ideas|null find($id, $lockMode = null, $lockVersion = null)
 * @method Ideas|null findOneBy(array $criteria, array $orderBy = null)
 * @method Ideas[]    findAll()
 * @method Ideas[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class IdeasRepository extends ServiceEntityRepository
{
    private $userRepository;
    private $commentsRepository;

    public function __construct(ManagerRegistry $registry, UserRepository $userRepository, CommentsRepository $commentsRepository)
    {
        $this->userRepository = $userRepository;
        $this->commentsRepository = $commentsRepository;
        parent::__construct($registry, Ideas::class);
    }

    public function save(Ideas $entity): void
    {
        if (!$entity instanceof Ideas) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($entity)));
        }
        $this->_em->persist($entity);
        $this->_em->flush();
    }

    public function remove(Ideas $entity): bool
    {
        if (!$entity instanceof Ideas) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($entity)));
        }
        $this->_em->remove($entity);
        $this->_em->flush();
        return true;
    }

    public function getIdeas($orderby, $isdesc, $from, $limit, $status = array(), $categories = array(), $types = array()){
        $query = "SELECT * FROM ideas ";

        if (count($categories)) {
            $query .= "WHERE ( ";
            foreach ($categories as $catid) {
                $sanitizedCategoryId = (int) $catid;
                $query .= "category_id='$sanitizedCategoryId' OR ";
            }
            $query = substr($query, 0, -3);
            $query .= ") ";
        }
        if (count($types)) {
            if (count($categories)) $query .= "AND (";
            else $query .= "WHERE ( ";
            foreach ($types as $typeid) {
                $sanitizedTypeId = (int) $typeid;
                $query .= "type_id='$sanitizedTypeId' OR ";
            }
            $query = substr($query, 0, -3);
            $query .= ") ";
        }
        if (count($status)) {
            if (count($categories) || count($types)) $query .= "AND (";
            else $query .= "WHERE ( ";
            foreach ($status as $s) {
                $query .= "status='$s' OR ";
            }
            $query = substr($query, 0, -3);
            $query .= ") ";
        }
        $query .= "ORDER BY $orderby ";

        if ($isdesc) $query .= "DESC";
        else $query .= "ASC";

        $query .= " LIMIT $from, $limit";
//        return $query;

        $conn = $this->getEntityManager()->getConnection();
        $ideas = $conn->prepare($query)->executeQuery()->fetchAllAssociative();

        if(!empty($ideas)){
            $ideas = $this->decorateIdeas($ideas);
            return $ideas;
        } else {
            return null;
        }
    }

    private function decorateIdeas($ideas){
        for($i = 0; $i < count($ideas); $i++) {
            $ideas[$i]["Comments"] = $this->commentsRepository->findBy(["idea_id" => $ideas[$i]["id"]]);
            $User = $this->userRepository->find($ideas[$i]['author_id']);
            if(!empty($User)){
                $ideas[$i]["User"] = $User->getProfile();
            } else {
                $ideas[$i]["User"] = null;
            }
        }

        return $ideas;
    }

    // /**
    //  * @return Ideas[] Returns an array of Ideas objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('i.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Ideas
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
