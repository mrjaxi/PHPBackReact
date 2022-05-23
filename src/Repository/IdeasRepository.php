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
         * AND ( type_id='1' OR type_id='2' OR type_id='3' OR type_id='4' OR type_id='5' )
         * AND ( i.status = '1' OR i.status = '2' OR i.status = '3' OR i.status = '4' OR i.status = '5' )
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
//        dd($getQuery);
        return $ideas ?: null;
    }

    /**
     * @param string $searchTitle
     * @param string $searchContent
     * @return array|null
     */
    public function searchIdeas($searchTitle = '', $searchContent = ''): ?array
    {
        /**
         * SELECT i Ideas i
         * WHERE (i.title LIKE '%систевф обр%' OR i.content LIKE '%звонкуу ваще%') <-- поиск по всей строке title и всей строке content
         * OR (i.title LIKE '%систевф%' OR i.title LIKE '%обр%')        <-- поиск отдельно по словам из строки title
         * OR (i.content LIKE '%звонкуу%' OR i.content LIKE '%ваще%')   <-- поиск отдельно по словам из строки content
         */
        if(empty($searchTitle) and empty($searchContent)){
            return null;
        }
        $query = $this->createQueryBuilder("i");
        $expr = $query->expr();
        $orMain = $expr->orX();
        $orTitle = $expr->orX();
        $orContent = $expr->orX();
        if(!empty($searchTitle) and !empty($searchContent)){
            // Если оба не пустые
            $titleWordsArr = explode(" ", $searchTitle);
            $contentWordsArr = explode(" ", $searchContent);
            $orMain->add($expr->like("i.title", "'%$searchTitle%'"));
            $orMain->add($expr->like("i.content", "'%$searchContent%'"));
            if(count($titleWordsArr) > 1) {
                foreach ($titleWordsArr as $word) {
                    // если слово больше 1 символа
                    if (mb_strlen($word, 'utf-8') > 1) {
                        $orTitle->add($expr->like("i.title", "'%$word%'"));
                    }
                }
            }
            if(count($contentWordsArr) > 1) {
                foreach ($contentWordsArr as $word) {
                    // если слово больше 1 символа
                    if (mb_strlen($word, 'utf-8') > 1) {
                        $orContent->add($expr->like("i.content", "'%$word%'"));
                    }
                }
            }

        } else {
            // Если один не пустой
            if(!empty($searchTitle)){
                $titleWordsArr = explode(" ", $searchTitle);
                $orMain->add($expr->like("i.title", "'%$searchTitle%'"));
                if(count($titleWordsArr) > 1) {
                    foreach ($titleWordsArr as $word) {
                        if (mb_strlen($word, 'utf-8') > 1) {
                            $orTitle->add($expr->like("i.title", "'%$word%'"));
                        }
                    }
                }
            }
            if(!empty($searchContent)){
                $contentWordsArr = explode(" ", $searchContent);
                $orMain->add($expr->like("i.content", "'%$searchContent%'"));
                if(count($contentWordsArr) > 1) {
                    foreach ($contentWordsArr as $word) {
                        if (mb_strlen($word, 'utf-8') > 1) {
                            $orContent->add($expr->like("i.content", "'%$word%'"));
                        }
                    }
                }
            }
        }
        $orWhere = $expr->orX()
            ->add($orMain)
            ->add($orTitle)
            ->add($orContent);
        $query->where($orWhere);

        $getQuery = $query->getQuery();
        /** @var array $ideas */
        $ideas = $getQuery->execute();
//        dd($getQuery);
        return $ideas ?: null;
    }
}
