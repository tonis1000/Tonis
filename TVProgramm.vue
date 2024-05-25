<!-- TVProgramm.vue -->
<template>
  <div>
    <!-- DATE SELECT -->
    <div class="datesWrapper">
      <div class="wrapperInner">
        <a @click.prevent="goToPrevDate" class="dateCta datePrev">Prev Date</a>
        <span>{{ displayDate | formatDate }}</span>
        <a @click.prevent="goToNextDate" class="dateCta dateNext">Next Date</a>
      </div>
    </div>
    <!-- DATE SELECT END-->

    <!-- PROGRAM START -->
    <div class="programWrapper">
      <div class="wrapperInner">
        <div class="channels">
          <div class="header chanelsHeader headerRow">Κανάλια</div>
          <div class="channel channelRow" v-for="channel in channelsFiltered" :key="channel.id">
            <div class="greyWrapper">
              <div class="imgWrapper">
                <img :src="channel.img" :alt="channel.name"/>
              </div>
            </div>
          </div>
        </div>
        <div class="programTimelineWrapper">
          <div class="programTimeline" id="programTimeline">
            <div class="programTimelineInner">
              <div class="currentLine" :style="currentTimeLeft">
                <div class="time">
                  <div class="hours">{{ hours }}</div>
                  <div class="divider">:</div>
                  <div class="minutes">{{ minutes }}</div>
                </div>
              </div>
              <div class="header timesHeader headerRow">
                <div class="time" v-for="hour in hoursArray" :key="hour">{{ hour }}</div>
              </div>
              <div class="channelsPrograms">
                <div class="channelPrograms channelRow" v-for="channel in channelsFiltered" :key="channel.id">
                  <template v-if="eventFiltered(channel.id).length > 0">
                    <div class="channelProgram" v-for="(event, index) in eventFiltered(channel.id)" :key="event.id" :style="calculateWidth(event.actual_time, event.end_time, index)">
                      <div class="channelProgramInner">
                        <div class="bg">
                          <div class="active" :style="calculateActiveWidth(event.actual_time, event.end_time, index)"></div>
                        </div>
                        <div class="info">
                          <div class="time">{{ event.actual_time | formatTime }} - {{ event.end_time | formatTime }}</div>
                          <div class="name" @click="showModal(event)">{{ event.title }}</div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="channelProgram" style="width:100%">
                      <div>
                        <div class="time">&nbsp;</div>
                        <div class="name">&nbsp;</div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- PROGRAM END -->
  </div>
</template>

<script>
export default {
  props: {
    displayDate: {
      type: String,
      required: true
    },
    channelsFiltered: {
      type: Array,
      required: true
    },
    hoursArray: {
      type: Array,
      required: true
    },
    hours: {
      type: Number,
      required: true
    },
    minutes: {
      type: Number,
      required: true
    }
  },
  methods: {
    goToPrevDate() {
      // Implement your method to go to the previous date
    },
    goToNextDate() {
      // Implement your method to go to the next date
    },
    eventFiltered(channelId) {
      // Implement your method to filter events by channelId
      return [];
    },
    calculateWidth(startTime, endTime, index) {
      // Implement your method to calculate the width of the event block
      return {};
    },
    calculateActiveWidth(startTime, endTime, index) {
      // Implement your method to calculate the active width of the event block
      return {};
    },
    showModal(event) {
      // Implement your method to show the event modal
    }
  },
  computed: {
    currentTimeLeft() {
      // Implement your method to calculate the current time left position
      return {};
    }
  },
  filters: {
    formatDate(value) {
      // Implement your date formatting logic
      return value;
    },
    formatTime(value) {
      // Implement your time formatting logic
      return value;
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
