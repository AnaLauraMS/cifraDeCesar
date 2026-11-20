package br.com.fatec.poneglyph_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "cipher")
public class Cipher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Hash criptográfico de uso único (serve como Chave Privada para a descriptografia)
    @Column(name = "hash_key", nullable = false, unique = true, length = 128)
    private String hashKey;

    // Passo da Cifra de César (número de casas deslocadas para mais ou para menos)
    @Column(name = "step", nullable = false)
    private Integer step;

    // Coluna para validar se o hash já foi utilizado (true/false) - Trava de uso único
    @Column(name = "used", nullable = false)
    private Boolean used = false;
}
