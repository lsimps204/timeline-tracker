<template>

<li :key="id">
    <div class="col-12">
        <!-- Attachment Title -->
        <h1 id="attachment-header" class="lead mb-2">{{index+1}}: {{ title }}</h1>
        <span v-if="showEditAttachmentTitle">
              <input type="text" class="form-control col-12 col-sm-8 col-md-6 my-2" id="newAttachmentTitleField" 
                    placeholder="Enter a new title" v-model="editedTitle"
                    :autofocus="showEditAttachmentTitle"/>
              <button type="button" id="submitNewAttachmentTitleBtn" class="btn btn-success btn-sm"
                @click="saveNewAttachmentTitle">Save Title</button>
              <button type="button" class="btn btn-sm"
                @click="cancelEditAttachmentTitle">Cancel</button>
            </span>

        <span @click="editAttachmentTitle" v-if="!showEditAttachmentTitle">
        <i class="far fa-edit fa-sm ml-2" 
            data-toggle="tooltip" 
            title="Edit attachment title"></i>
        </span>

        <span @click="deleteAttachment">
            <i class="fas fa-times fa-sm ml-2 text-danger" 
            data-toggle="tooltip"
            id="delete-icon" 
            title="Delete this attachment"></i>
        </span>

        <!-- Attachment icons -->
        <div v-if="attachmentType=='image'" class="mt-2">
            <router-link class="nav-link ml-2" 
                :to="{ name: 'image-view', params: {id: id}}"
                data-toggle="tooltip" title="View attachment">
                <img height="25" width="25" :src="iconSource" class="mb-2">
            </router-link>
        </div>
        <div v-else>
            <a href="#" @click="attachmentClicked" 
                data-toggle="tooltip" title="Download attachment" class="ml-2">
                <img :src="iconSource" height="25" width="25" class="mb-2"></img>
            </a>
        </div>
    </div> <!--/col -->
    
    <!-- Attachment -->
    <div class="col-12 col-sm-10 col-md-8 offset-sm-1 offset-md-2">
        <div v-if="downloadAttachment" class="mt-2">
            <div v-if="attachmentType=='docx'">
                <iframe :src="source" class="mb-2"></iframe>
            </div>
        </div>
    </div>
      <flash :message="flash.msg" :type="flash.type" 
        v-if="shouldFlash" @finished="clearFlash"></flash>

</li>

</template>

<script>
import Attachment from '../models/Attachment.js'

export default {
    name: 'attachment-component',
    props: ['data', 'index'],

    data() {
        return {
            attachment: this.data,
            id: this.data.Id,
            source: '',
            downloadAttachment: false,
            iconSource: '',
            showEditAttachmentTitle: false,
            editedTitle: '',
            submitted: false,
            flash: {
                msg:'',
                type:''
            },
            deleteIntention: false
        }
    },

    computed: {
        attachmentType() {
            let name = this.iconSource.split("/").pop()
            if (name.startsWith("png") || name.startsWith("jpg")) return "image"
            else return "docx"
        },
        title() {
            /* Get the attachment from the store data, or defer to the component props passed in if that doesn't exit */
            let i = this.$store.getters.getAttachmentFromLocalData(this.id) || this.data
            return i ? i.title : i.Title
        },
        shouldFlash() { return this.submitted },
    },

    methods: {
        /* Gets the attachment data from the API or the store */
        getAttachment() {
            return new Promise((resolve,reject) => {
                let attachment = this.$store.getters.getAttachmentFromLocalData(this.id)
                if (attachment) {
                    this.source = attachment.data
                    resolve()
                } else {
                    Attachment.getDownloadLink(this.id)
                    .then(response => {
                        this.download(response.data).then(res => resolve())
                    })
                }
            })
        },

        download(url) {
            return new Promise((resolve,reject) => {
                Attachment.download(url).then(response => {
                    this.source = response.data
                    this.$store.commit('addAttachmentToStorage', {
                        'id': this.id,
                        'title': this.data.Title,
                        'data': response.data
                    })
                    resolve()
                })
            })
        },

        getIcon() {
        /* Determine whether attachment icon is png/jpg/docx */
            if (this.source.length) {
                let type = this.source.split(";")[0]
                type = type.split("/")[1]
                this.iconSource = this.getIconPath(type)
            }
        },

        /* Uses the type to determine the thumbnail icon to show */
        getIconPath(type) {
            let path;
            switch(type) {
                case 'jpg':
                case 'jpeg':
                    path = '/src/assets/jpgicon.png'
                    break
                case 'png':
                    path = '/src/assets/pngicon.png'
                    break
                default:
                    path = '/src/assets/wordicon.png'
                    break
            }
            return path;
        },

        /* Methods for editing and deleting attachment */
        saveNewAttachmentTitle() {
            if (this.editedTitle.length > 3) {
                this.disableBtn("submitNewAttachmentTitleBtn")
                this.$store.dispatch('editAttachmentTitle', {id: this.id, newTitle: this.editedTitle})
                .then(response => {
                    this.setFlash("New attachment title added", "success")
                    this.cancelEditAttachmentTitle()
                    this.$store.commit('editAttachmentInStorage', {
                        'id': response.Id,
                        'title': response.Title
                    })
                }).catch(err => this.setFlash("Title change failed", "warning"))
            } else {
                this.setFlash("Title must be 4 characters or more", "warning")
            }
        },

        cancelEditAttachmentTitle() {
            this.showEditAttachmentTitle = false
            this.editedTitle = ''
        },

        editAttachmentTitle() { this.showEditAttachmentTitle = true },

        deleteAttachment() {
            this.$dialog.confirm("Are you sure you wish to delete this attachment?")
                .then(() => {
                    this.deleteIntention = true
                    this.$store.dispatch('deleteAttachment', {id: this.id})
                })
        },

        attachmentClicked() { this.downloadAttachment = true },

	    setFlash(message,type) {
	      this.submitted = true
	      this.flash.msg = message
	      this.flash.type = type
	    },

	    clearFlash() {
	      this.submitted = false
	      this.flash.msg = ''
	      this.flash.type = ''
	    },

        /* jQuery helpers */
        disableBtn(id) {
            $("#" + id).prop('disabled', true)
            $("#" + id).text("Loading...")
        }
    },

    created() {
        this.getAttachment().then(() => this.getIcon())
    },

    beforeDestroy() {
        if (this.deleteIntention) this.$emit("deleted")
    }

}

</script>

<style>
#attachment-header {
    display:inline;
}

#delete-icon {
    cursor: pointer;
}

iframe {
    max-height: 25px;
    max-width: 30px;
}
</style>