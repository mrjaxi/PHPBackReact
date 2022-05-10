<?php

namespace App\Repository;

use App\Entity\Votes;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Votes|null find($id, $lockMode = null, $lockVersion = null)
 * @method Votes|null findOneBy(array $criteria, array $orderBy = null)
 * @method Votes[]    findAll()
 * @method Votes[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VotesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Votes::class);
    }

    /**
     * @param Votes $entity
     * @param bool $flush
     */
    public function save(Votes $entity, $flush=true): void
    {
        $this->_em->persist($entity);
        if($flush){
            $this->_em->flush();
        }
    }

    /**
     * @param Votes $entity
     * @param bool $flush
     */
    public function remove(Votes $entity, $flush=true): void
    {
        $this->_em->remove($entity);
        if($flush){
            $this->_em->flush();
        }
    }
}
