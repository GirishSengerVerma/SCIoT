; PDDL Domain Description. 
;   The goal is to enable actuators for lowering the risk of a weather event at certain locations and to
;   move authorities units between different locations to tackle weather events there in the most efficient way.
;   If there are no events anymore at a location, units should move back to the hub (e.g. to re-fuel and re-equip).

(define (domain weather-events-action-planning)

    ; TODO remove requirements that are not needed
    (:requirements :strips :typing :equality :negative-preconditions)

    (:types
        location unit weathereventtype - object
    )

    ; un-comment following line if constants are needed
    ;(:constants )

    (:predicates
        (is-hub ?l - location)
        (has-alarm-light-at ?l - location)
        (has-alarm-sound-at ?l - location)
        (has-water-protection-wall-at ?l - location)
        (can-lock-down-at ?l - location)
        (alarm-light-enabled-at ?l - location)
        (alarm-sound-enabled-at ?l - location)
        (water-protection-wall-enabled-at ?l - location)
        (lockdown-enabled-at ?l - location)
        (is-weatherevent-at ?w - weathereventtype ?l - location)
        (is-unit-operating ?u - unit)
        (is-being-operated-at ?l - location)
        (is-police-at ?l - location)
        (is-fire-truck-at ?l - location)
        (is-ambulance-at ?l - location)
        (is-unit-at ?u - unit ?l - location)
        (is-related-to-water ?w - weathereventtype)
        (is-police-car ?u - unit)
        (is-fire-truck ?u - unit)
        (is-ambulance ?u - unit)
        (unit-performed-action ?u - unit)
    )

    (:action alarm-locals-by-light
        :parameters (?l - location ?w - weathereventtype)
        :precondition (and
            (has-alarm-light-at ?l)
            (not (alarm-light-enabled-at ?l))
            (is-weatherevent-at ?w ?l)
        )
        :effect (and
            (alarm-light-enabled-at ?l)
        )
    )

    (:action alarm-locals-by-sound
        :parameters (?l - location ?w - weathereventtype)
        :precondition (and
            (has-alarm-sound-at ?l)
            (not (alarm-sound-enabled-at ?l))
            (is-weatherevent-at ?w ?l)
        )
        :effect (and
            (alarm-light-enabled-at ?l)
        )
    )

    (:action drive-up-water-protection-wall
        :parameters (?l - location ?w - weathereventtype)
        :precondition (and
            (has-water-protection-wall-at ?l)
            (not (water-protection-wall-enabled-at ?l))
            (is-weatherevent-at ?w ?l)
            (is-related-to-water ?w)
        )
        :effect (and
            (water-protection-wall-enabled-at ?l)
        )
    )

    (:action lock-down-location
        :parameters (?l - location ?w - weathereventtype)
        :precondition (and
            (can-lock-down-at ?l)
            (not (lockdown-enabled-at ?l))
            (is-weatherevent-at ?w ?l)
        )
        :effect (and
            (lockdown-enabled-at ?l)
        )
    )

    (:action move-to-event-location
        :parameters (?unit - unit ?from - location ?to - location ?eventtype - weathereventtype)
        :precondition (and
            (is-unit-at ?unit ?from)
            (is-weatherevent-at ?eventtype ?to)
            (not (is-unit-operating ?unit))
        )
        :effect (and
            (not (is-unit-at ?unit ?from))
            (is-unit-at ?unit ?to)
        )
    )

    (:action perform-police-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-police-car ?unit)
            (not (unit-performed-action ?unit))
            (not (is-unit-operating ?unit))
            (is-weatherevent-at ?eventtype ?location)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-being-operated-at ?location)
            (is-police-at ?location)
        )
    )

    (:action perform-fire-truck-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-fire-truck ?unit)
            (not (is-unit-operating ?unit))
            (not (unit-performed-action ?unit))
            (is-weatherevent-at ?eventtype ?location)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-being-operated-at ?location)
            (is-fire-truck-at ?location)
        )
    )

    (:action perform-ambulance-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-ambulance ?unit)
            (not (is-unit-operating ?unit))
            (not (unit-performed-action ?unit))
            (is-weatherevent-at ?eventtype ?location)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-being-operated-at ?location)
            (is-ambulance-at ?location)
        )
    )

    (:action return-to-hub
        :parameters (?unit - unit ?from - location ?to - location)
        :precondition (and
            (is-unit-at ?unit ?from)
            (not (is-hub ?from))
            (is-hub ?to)
            (not (is-unit-operating ?unit))
        )
        :effect (and
            (not (is-unit-at ?unit ?from))
            (is-unit-at ?unit ?to)
        )
    )

    (:action refuel-and-reequip-at-hub
        :parameters (?u - unit ?l - location)
        :precondition (and
            (is-unit-at ?u ?l)
            (is-hub ?l)
            (not (unit-performed-action ?u))
        )
        :effect (and
            (unit-performed-action ?u)
        )
    )

)