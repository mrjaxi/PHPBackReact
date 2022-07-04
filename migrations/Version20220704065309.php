<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220704065309 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE ideas DROP FOREIGN KEY FK_1DB2F1DE54179331');
        $this->addSql('ALTER TABLE ideas ADD CONSTRAINT FK_1DB2F1DE54179331 FOREIGN KEY (official_comment_id) REFERENCES comments (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE ideas DROP FOREIGN KEY FK_1DB2F1DE54179331');
        $this->addSql('ALTER TABLE ideas ADD CONSTRAINT FK_1DB2F1DE54179331 FOREIGN KEY (official_comment_id) REFERENCES comments (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
