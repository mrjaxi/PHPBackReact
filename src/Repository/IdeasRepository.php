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

    /**
     * @param Ideas $entity
     * @param bool $flush
     */
    public function save(Ideas $entity, $flush=true): void
    {
        if (!$entity instanceof Ideas) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($entity)));
        }
        $this->_em->persist($entity);
        if($flush){
            $this->_em->flush();
        }
    }

    /**
     * @param Ideas $entity
     * @param bool $flush
     * @return bool
     */
    public function remove(Ideas $entity, $flush=true): bool
    {
        if (!$entity instanceof Ideas) {
            throw new \RuntimeException(sprintf('Instances of "%s" are not supported.', \get_class($entity)));
        }
        $this->_em->remove($entity);
        if($flush){
            $this->_em->flush();
        }
        return true;
    }

    /**
     * @param $orderby
     * @param $isdesc
     * @param $from
     * @param $limit
     * @param array $status
     * @param array $categories
     * @param array $types
     * @return array|null
     */
    public function getIdeas($orderby, $isdesc, $from, $limit, $status = array(), $categories = array(), $types = array()): ?array
    {
        /**
         * SELECT * FROM ideas
         * WHERE ( category_id='4' )
         * AND (type_id='1' OR type_id='2' OR type_id='3' OR type_id='4' OR type_id='5' )
         * AND (i.status = '1' OR i.status = '2' OR i.status = '3' OR i.status = '4' OR i.status = '5')
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
        /** @var array $ideas */
        $ideas = $getQuery->execute();
//        dd($ideas);
        if(!empty($ideas)){
            return $ideas;
        } else {
            return null;
        }
    }

    /**
     * @param string $searchText
     * @return array|null
     */
    public function searchIdeas(string $searchText): ?array
    {
        if(empty($searchText)){
            return null;
        }
        $wordsArr = explode(" ", $searchText);
        $query = $this->createQueryBuilder("i");
        $expr = $query->expr();
        $orMain = $expr->orX()
            ->add($expr->like("i.title", "'%$searchText%'"))
            ->add($expr->like("i.content", "'%$searchText%'"));
        $orTitle = $expr->orX();
        $orContent = $expr->orX();
        $orWhere = $expr->orX();
        if(count($wordsArr) > 1) {
            foreach ($wordsArr as $word) {
                if (mb_strlen($word, 'utf-8') > 1) {
                    $orTitle->add($expr->like("i.title", "'%$word%'"));
                }
            }
            foreach ($wordsArr as $word) {
                if (mb_strlen($word, 'utf-8') > 1) {
                    $orContent->add($expr->like("i.content", "'%$word%'"));
                }
            }
        }
        $orWhere->add($orMain)
            ->add($orTitle)
            ->add($orContent);
        $query->where($orWhere);

        $getQuery = $query->getQuery();
        /** @var array $ideas */
        $ideas = $getQuery->execute();
//        dd($getQuery);
        if(!empty($ideas)){
            return $ideas;
        } else {
            return null;
        }
    }
}
