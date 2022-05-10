<?php

namespace App\Repository;

use App\Entity\Types;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;

/**
 * @method Types|null find($id, $lockMode = null, $lockVersion = null)
 * @method Types|null findOneBy(array $criteria, array $orderBy = null)
 * @method Types[]    findAll()
 * @method Types[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TypesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Types::class);
    }

    /**
     * @param Types $entity
     * @param bool $flush
     */
    public function save(Types $entity, $flush=true): void
    {
        if (!$entity instanceof Types) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($entity)));
        }
        $this->_em->persist($entity);
        if($flush){
            $this->_em->flush();
        }
    }

    /**
     * @param Types $entity
     * @param bool $flush
     * @return bool
     */
    public function remove(Types $entity, $flush=true): bool
    {
        if (!$entity instanceof Types) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($entity)));
        }
        $this->_em->remove($entity);
        if($flush){
            $this->_em->flush();
        }
        return true;
    }
    // /**
    //  * @return Types[] Returns an array of Types objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('t.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Types
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
