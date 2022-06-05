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
         * WHERE ( category_id='4' )    <- поиск всех категорий из массива $categories
         * AND ( type_id='1' OR type_id='2' OR type_id='3' OR type_id='4' OR type_id='5' )  <- поиск всех типов из массива $types
         * AND ( i.status = '1' OR i.status = '2' OR i.status = '3' OR i.status = '5' )     <- поиск всех статусов из массива $status
         * ORDER BY date DESC   <- сортировка по полю $orderby по $isdesc
         * LIMIT 10 OFFSET 10   <- limit $limit offset $from
         */
        $query = $this->createQueryBuilder("i");
        // Конструктор выражений
        $expr = $query->expr();
        /** Переменные для Дизъюнкции(or) логических выражений категорий, типов, и статусов соответственно
         * Пример: ( i.status = '1' OR i.status = '2' OR i.status = '3' OR i.status = '5' )
         */
        $orCategories = $expr->orX();
        $orTypes = $expr->orX();
        $orStatus = $expr->orX();
        /** Переменная для Конъюнкции(and) Дизъюнкций(or) категорий, типов, и статусов соответственно
         * Пример: ( category_id='4' ) AND ( type_id='1' OR type_id='2' OR type_id='3' OR type_id='4' OR type_id='5' )
         */
        $andX = $expr->andX();
        // Если массив категорий $categories не пустой, то каждый id категории из массива добавляется в Дизъюнкцию категорий
        if (count($categories)) {
            for ($i = 0; $i < count($categories); $i++) {
                $sanitizedCategoryId = (int)$categories[$i];
                $orCategories->add($expr->eq("i.category", "'$sanitizedCategoryId'"));
            }
        }
        // Если массив типов $types не пустой, то каждый id типа из массива добавляется в Дизъюнкцию типов
        if (count($types)) {
            for ($i = 0; $i < count($types); $i++) {
                $sanitizedTypeId = (int)$types[$i];
                $orTypes->add($expr->eq("i.type", "'$sanitizedTypeId'"));
            }
        }
        // Если массив статусов $status не пустой, то каждый id статуса из массива добавляется в Дизъюнкцию статусов
        if (count($status)) {
            for ($i = 0; $i < count($status); $i++) {
                $orStatus->add($expr->eq("i.status", "'$status[$i]'"));
            }
        }
        $orderType = $isdesc ? "DESC" : "ASC";
        /** В конъюнкцию обединяются все сформированные дизъюнкции
         * Пример: ( category_id='4' ) AND ( type_id='1' OR type_id='2' OR type_id='3' OR type_id='4' OR type_id='5' ) AND ( i.status = '1' OR i.status = '2' OR i.status = '3' OR i.status = '5' )
         */
        $andX->add($orCategories)
            ->add($orTypes)
            ->add($orStatus);
        // добавляем в where сформированную конъюнкцию
        $query->where($andX)
            ->orderBy("i.$orderby", "$orderType") // указываем по какому полю сортировать и какого типа сортировка
            ->setMaxResults( $limit ) // указываем сколько максимум записей в результате
            ->setFirstResult( $from ); // указываем с какой записи начинать отбор
        // Получаем запрос
        $getQuery = $query->getQuery();
        // Исполняем запрос и получаем массив entity
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
        /** Переменные для Дизъюнкции(or) like по title и content, слов title и слов content соответственно
         * Пример: ( i.status = '1' OR i.status = '2' OR i.status = '3' OR i.status = '5' )
         */
        $expr = $query->expr();
        $orMain = $expr->orX();
        $orTitleWords = $expr->orX();
        $orContentWords = $expr->orX();
        $wordLength = 2;
        // Если оба не пустые
        if(!empty($searchTitle) and !empty($searchContent)){
            // Разделяем строки title и content на массивы слов по пробелу
            $titleWordsArr = explode(" ", $searchTitle);
            $contentWordsArr = explode(" ", $searchContent);
            /** Добавляем полностью строки в дизъюнкцию like по title и content
             * формируется примерно (i.title LIKE '%систему обр%' OR i.content LIKE '%звонко ваще%')
             */
            $orMain->add($expr->like("i.title", "'%$searchTitle%'"));
            $orMain->add($expr->like("i.content", "'%$searchContent%'"));
            if(count($titleWordsArr) > 1) {
                // перебираем слова title
                foreach ($titleWordsArr as $word) {
                    // если слово больше 2 символов
                    if (mb_strlen($word, 'utf-8') > $wordLength) {
                        $orTitleWords->add($expr->like("i.title", "'%$word%'"));
                    }
                }
                // Формируется примерно (i.title LIKE '%систевф%' OR i.title LIKE '%обр%')
            }
            if(count($contentWordsArr) > 1) {
                // перебираем слова content
                foreach ($contentWordsArr as $word) {
                    if (mb_strlen($word, 'utf-8') > $wordLength) {
                        $orContentWords->add($expr->like("i.content", "'%$word%'"));
                    }
                }
                // Формируется примерно (i.content LIKE '%звонкуу%' OR i.content LIKE '%ваще%')
            }

        } else {
            // Если один не пустой
            if(!empty($searchTitle)){
                $titleWordsArr = explode(" ", $searchTitle);
                // Добавляем полностью строку title в дизъюнкцию like по title и content
                $orMain->add($expr->like("i.title", "'%$searchTitle%'"));
                if(count($titleWordsArr) > 1) {
                    foreach ($titleWordsArr as $word) {
                        if (mb_strlen($word, 'utf-8') > $wordLength) {
                            $orTitleWords->add($expr->like("i.title", "'%$word%'"));
                        }
                    }
                }
            }
            if(!empty($searchContent)){
                $contentWordsArr = explode(" ", $searchContent);
                // Добавляем полностью строку content в дизъюнкцию like по title и content
                $orMain->add($expr->like("i.content", "'%$searchContent%'"));
                if(count($contentWordsArr) > 1) {
                    foreach ($contentWordsArr as $word) {
                        if (mb_strlen($word, 'utf-8') > $wordLength) {
                            $orContentWords->add($expr->like("i.content", "'%$word%'"));
                        }
                    }
                }
            }
        }
        /** формируется общая дизъюнкция для where поиска идей по словам
         * Пример: (i.title LIKE '%систевф обр%' OR i.content LIKE '%звонкуу ваще%')
         * OR (i.title LIKE '%систевф%' OR i.title LIKE '%обр%')
         * OR (i.content LIKE '%звонкуу%' OR i.content LIKE '%ваще%')
         */
        $orWhere = $expr->orX()
            ->add($orMain)
            ->add($orTitleWords)
            ->add($orContentWords);
        $query->where($orWhere);

        $getQuery = $query->getQuery();
        /** @var array $ideas */
        $ideas = $getQuery->execute();
//        dd($getQuery);
        return $ideas ?: null;
    }
}
