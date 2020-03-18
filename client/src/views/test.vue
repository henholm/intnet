</div>
  <div
    class="ts-container"
    v-for="role in Object.keys(users)"
    v-bind:key="role"
  ><h3>{{role}}</h3>
    <div
      class="timeslot-container"
      v-for="user in users[role]"
      v-bind:key="user.id"
    >
      <button
        type="button"
        class="booked"
        ref="user.id"
        v-if="user.isAdmin===1"
      ><h4>{{user.name}}</h4></button>
      <button
        type="button"
        class="reservedByMe"
        ref="user.id"
        v-else-if="user.isAssistant===1"
        v-on:click="revokePrivilege($event, user.id)"
      ><h4>{{user.name}}</h4></button>
      <button
        type="button"
        class="open"
        ref="user.id"
        v-else
        v-on:click="grantPrivilege($event, user.id)"
      ><h4>{{user.name}}</h4></button>
    </div>
  </div>
</div>
