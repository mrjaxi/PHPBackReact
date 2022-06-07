<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220607040709 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962A5B6FEF7D');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A5B6FEF7D FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE status ADD color VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE types ADD color VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF5B6FEF7D');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFA76ED395');
        $this->addSql('ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF5B6FEF7D FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962A5B6FEF7D');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A5B6FEF7D FOREIGN KEY (idea_id) REFERENCES ideas (id) ON UPDATE NO ACTION ON DELETE SET NULL');
        $this->addSql('ALTER TABLE status DROP color');
        $this->addSql('ALTER TABLE types DROP color');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFA76ED395');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF5B6FEF7D');
        $this->addSql('ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE SET NULL');
        $this->addSql('ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF5B6FEF7D FOREIGN KEY (idea_id) REFERENCES ideas (id) ON UPDATE NO ACTION ON DELETE SET NULL');
    }
}
