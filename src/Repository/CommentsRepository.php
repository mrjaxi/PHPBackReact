<?php

namespace App\Repository;

use App\Entity\Comments;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Comments|null find($id, $lockMode = null, $lockVersion = null)
 * @method Comments|null findOneBy(array $criteria, array $orderBy = null)
 * @method Comments[]    findAll()
 * @method Comments[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CommentsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Comments::class);
    }

    /**
     * @param Comments $entity
     * @param bool $flush
     */
    public function save(Comments $entity, $flush=true): void
    {
        $this->_em->persist($entity);
        if($flush){
            $this->_em->flush();
        }
    }

    /**
     * @param Comments $entity
     * @param bool $flush
     */
    public function remove(Comments $entity, $flush=true): void
    {
        $this->_em->remove($entity);
        if($flush){
            $this->_em->flush();
        }
    }

    public function disableSoftDeleteable(): void
    {
        $this->_em->getFilters()->disable('soft-deleteable');
    }

    public function enableSoftDeleteable(): void
    {
        $this->_em->getFilters()->enable('soft-deleteable');
    }

    // /**
    //  * @return Comments[] Returns an array of Comments objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('c.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Comments
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
