package opensource.project.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "weight_factor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeightFactor
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // 예: dwell_time, speed, crowd_density

    @Column(nullable = false)
    private Float weight; // 가중치 값
}

