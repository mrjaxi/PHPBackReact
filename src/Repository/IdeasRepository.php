<?php

namespace App\Repository;

use App\Entity\Ideas;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use function Symfony\Component\DomCrawler\add;

/**
 * @method Ideas|null find($id, $lockMode = null, $lockVersion = null)
 * @method Ideas|null findOneBy(array $criteria, array $orderBy = null)
 * @method Ideas[]    findAll()
 * @method Ideas[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class IdeasRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
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
        /**
         * SELECT * FROM ideas
         * WHERE ( category_id='4' )
         * AND (type_id='1' OR type_id='2' OR type_id='3' OR type_id='4' OR type_id='5' )
         * AND (status='completed' OR status='started' OR status='planned' OR status='considered' OR status='declined' OR status='new' )
         * ORDER BY date DESC
         * LIMIT 10 OFFSET 10
         */
        $query = $this->createQueryBuilder("i");
        $expr = $query->expr();
        $orCategories = $expr->orX();
        $orTypes = $expr->orX();
        $orStatus = $expr->orX();
        $andX = $expr->andX();
        if (count($categories)) {
            for ($i = 0; $i < count($categories); $i++) {
                $sanitizedCategoryId = (int)$categories[$i];
                $orCategories->add($expr->eq("i.category", "'$sanitizedCategoryId'"));
            }
        }
        if (count($types)) {
            for ($i = 0; $i < count($types); $i++) {
                $sanitizedTypeId = (int)$types[$i];
                $orTypes->add($expr->eq("i.type", "'$sanitizedTypeId'"));
            }
        }
        if (count($status)) {
            for ($i = 0; $i < count($status); $i++) {
                $orStatus->add($expr->eq("i.status", "'$status[$i]'"));
            }
        }
        $orderType = $isdesc ? "DESC" : "ASC";
        $andX->add($orCategories)
            ->add($orTypes)
            ->add($orStatus);

        $query->where($andX)
            ->orderBy("i.$orderby", "$orderType")
            ->setMaxResults( $limit )
            ->setFirstResult( $from );

        $getQuery = $query->getQuery();
        $ideas = $getQuery->execute();
//        dd($getQuery);
        if(!empty($ideas)){
            return $ideas;
        } else {
            return null;
        }
    }
}
