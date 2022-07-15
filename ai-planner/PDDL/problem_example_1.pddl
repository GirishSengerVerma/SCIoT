(define (problem weather-events-action-planning-example-1)
    (:domain weather-events-action-planning)
    (:objects
        skp svo smes hub - location
        pc1 pc2 ft1 ft2 a1 a2 - unit
        storm hailstorm thunderstorm flood cold heat wildfire earthquake badair - weathereventtype
    )

    (:init
        ; Units: Types
        (is-police-car pc1)
        (is-police-car pc2)
        (is-fire-truck ft1)
        (is-fire-truck ft2)
        (is-ambulance a1)
        (is-ambulance a2)

        ; Units: Positioning
        (is-unit-at pc1 hub)
        (is-unit-at pc2 hub)
        (is-unit-at ft1 hub)
        (is-unit-at ft2 hub)
        (is-unit-at a1 hub)
        (is-unit-at a2 hub)

        ; Hub
        (is-hub hub)

        ; SKP: Actuators
        (has-alarm-light-at skp)
        (has-alarm-sound-at skp)
        (can-lock-down-at skp)

        ; SKP: Enabled Actuators
        (alarm-light-enabled-at skp)

        ; SVO: Actuators
        (has-alarm-light-at svo)
        (can-lock-down-at svo)

        ; SVO: Enabled Actuators

        ; SMES: Actuators
        (has-alarm-light-at smes)
        (can-lock-down-at smes)
        (has-water-protection-wall-at smes)

        ; SMES: Enabled Actuators

        ; Weather Events: Properties
        (is-related-to-water flood)

        ; Weather Events: Current Events & Risks
        (is-weatherevent-at wildfire skp)
        (is-weatherevent-at badair svo)
    )

    (:goal
        (and
            (unit-performed-action pc1)
            (unit-performed-action pc2)
            (unit-performed-action ft1)
            (unit-performed-action ft2)
            (unit-performed-action a1)
            (unit-performed-action a2)

            (is-being-operated-at skp)
            (is-fire-truck-at skp)
            (is-police-at skp)

            (is-being-operated-at svo)
            (is-fire-truck-at svo)
            (is-police-at svo)
            (is-ambulance-at svo)
        )
    )

    ;(:metric minimize
    ;    (+
    ;        (current-risk wildfire smes)
    ;        (current-risk badair svo)
    ;    )
    ;)

    ;un-comment the following line if metric is needed
    ;(:metric minimize (???))
    ; TODO Goal: 
    ;           minimize sum of all current risks (most important) and 
    ;           maximize sum of operated locations (less important) and

    ; TODO Subgoal (preference): units back at authorities hub

    ; TODO If at a location there is no weather event: deactivate alarm light and tone and lockdown again
)