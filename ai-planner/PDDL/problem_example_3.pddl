(define (problem weather-events-action-planning-example-1)
    (:domain weather-events-action-planning)
    (:objects
        skp svo smes hub - location
        pc1 ft1 a1 - unit
        storm hailstorm thunderstorm flood cold heat wildfire earthquake badair - weathereventtype
    )

    (:init
        ; Hub
        (is-hub hub)

        ; Units: Types
        (is-police-car pc1)
        (is-fire-truck ft1)
        (is-ambulance a1) ; should return to hub as not needed

        ; Units: Positioning
        (is-unit-at pc1 skp)
        (is-unit-at ft1 skp)
        (is-unit-at a1 skp)
        (= (units-at-hub) 0)

        ; Weather Event at SKP
        (is-weather-event-at wildfire skp)
        (= (current-risk wildfire skp) 3)
        (needs-fire-truck-at skp)
        (needs-police-car-at skp)
    )

    (:goal
        (and
            ; All units have to either perform actions at a weather event location or refuel and reequip at hub
            (unit-performed-action pc1)
            (unit-performed-action ft1)
            (unit-performed-action a1)
        )
    )

    (:metric minimize
        (+
            (* 3 (current-risk wildfire skp))
            (units-at-hub)
        )
    )
)